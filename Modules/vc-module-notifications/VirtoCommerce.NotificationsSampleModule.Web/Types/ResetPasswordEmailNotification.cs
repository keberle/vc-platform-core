using VirtoCommerce.NotificationsModule.Core.Model;

namespace VirtoCommerce.NotificationsSampleModule.Web.Types
{
    public class ResetPasswordEmailNotification : EmailNotification
    {
        public string Url { get; set; }
    }
}
