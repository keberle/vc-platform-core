using System;
using VirtoCommerce.NotificationsModule.Core.Model;
using VirtoCommerce.Platform.Core.Common;

namespace VirtoCommerce.NotificationsModule.Data.Model
{
    public class EmailNotificationMessageEntity : NotificationMessageEntity
    {
        public override NotificationMessage ToModel(NotificationMessage message)
        {
            if (message is EmailNotificationMessage emailNotificationMessage)
            {
                emailNotificationMessage.Subject = Subject;
                emailNotificationMessage.Body = Body;
            }

            return base.ToModel(message);
        }

        public override NotificationMessageEntity FromModel(NotificationMessage message)
        {
            if (message is EmailNotificationMessage emailNotificationMessage)
            {
                Subject = emailNotificationMessage.Subject;
                Body = emailNotificationMessage.Body;
            }

            return base.FromModel(message);
        }

        public override void Patch(NotificationMessageEntity message)
        {
            if (message is EmailNotificationMessageEntity emailNotificationMessageEntity)
            {
                emailNotificationMessageEntity.Subject = Subject;
                emailNotificationMessageEntity.Body = Body;
            }

            base.Patch(message);
        }
    }
}
