using VirtoCommerce.ExportModule.Core.Model;
using VirtoCommerce.Platform.Core.Common;
using VirtoCommerce.PricingModule.Core.Model.Search;

namespace VirtoCommerce.PricingModule.Data.ExportImport
{
    public class PricelistExportDataQuery : ExportDataQuery
    {
        public override SearchCriteriaBase CreateSearchCriteria()
        {
            return new PricelistSearchCriteria();
        }
    }
}