using System;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.Extensions.Logging;
using Polly;
using VirtoCommerce.NotificationsModule.Core.Exceptions;
using VirtoCommerce.NotificationsModule.Core.Model;
using VirtoCommerce.NotificationsModule.Core.Services;
using VirtoCommerce.Platform.Core.Common;

namespace VirtoCommerce.NotificationsModule.Data.Senders
{
    public class NotificationSender : INotificationSender
    {
        private readonly int _maxRetryAttempts = 3;
        private readonly INotificationTemplateRenderer _notificationTemplateRender;
        private readonly INotificationMessageService _notificationMessageService;
        private readonly INotificationMessageSenderProviderFactory _notificationMessageAccessor;
        private readonly ILogger<NotificationSender> _logger;

        public NotificationSender(INotificationTemplateRenderer notificationTemplateRender
            , INotificationMessageService notificationMessageService
            , ILogger<NotificationSender> logger
            , INotificationMessageSenderProviderFactory notificationMessageAccessor)
        {
            _notificationTemplateRender = notificationTemplateRender;
            _notificationMessageService = notificationMessageService;
            _notificationMessageAccessor = notificationMessageAccessor;
            _logger = logger;
        }

        public void ScheduleSendNotification(Notification notification, string language)
        {
            BackgroundJob.Enqueue(() => SendNotificationAsync(notification, language));
        }

        public async Task<NotificationSendResult> SendNotificationAsync(Notification notification, string language)
        {
            if (notification == null)
            {
                throw new ArgumentNullException(nameof(notification));
            }

            var result = new NotificationSendResult();

            var message = AbstractTypeFactory<NotificationMessage>.TryCreateInstance($"{notification.Kind}Message");
            message.LanguageCode = language;
            message.MaxSendAttemptCount = _maxRetryAttempts + 1;
            notification.ToMessage(message, _notificationTemplateRender);

            await _notificationMessageService.SaveNotificationMessagesAsync(new[] { message });

            var policy = Policy.Handle<SentNotificationException>().WaitAndRetryAsync(_maxRetryAttempts, retryAttempt => TimeSpan.FromSeconds(Math.Pow(3, retryAttempt))
                , (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogError(exception, $"Retry {retryCount} of {context.PolicyKey}, due to: {exception}.");
                });

            var policyResult = await policy.ExecuteAndCaptureAsync(() =>
            {
                message.LastSendAttemptDate = DateTime.Now;
                message.SendAttemptCount++;
                return _notificationMessageAccessor.GetSenderForNotificationType(notification.Kind).SendNotificationAsync(message);
            });

            if (policyResult.Outcome == OutcomeType.Successful)
            {
                result.IsSuccess = true;
                message.SendDate = DateTime.Now;
            }
            else
            {
                result.ErrorMessage = policyResult.FinalException?.Message;
                message.LastSendError = policyResult.FinalException?.ToString();
            }

            await _notificationMessageService.SaveNotificationMessagesAsync(new[] { message });

            return result;
        }
    }
}
