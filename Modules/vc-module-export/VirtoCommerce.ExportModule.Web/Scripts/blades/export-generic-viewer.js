angular.module('virtoCommerce.exportModule')
    .controller('virtoCommerce.exportModule.exportGenericViewerController', ['$scope', 'platformWebApp.bladeNavigationService', function ($scope, bladeNavigationService) {
        $scope.uiGridConstants = uiGridHelper.uiGridConstants;
        $scope.hasMore = true;
        $scope.items = [];
        
        var blade = $scope.blade;
        blade.isLoading = true;
        $scope.blade.headIcon = 'fa-upload';

        function initializeBlade() {
            blade.isLoading = false;
        }

        blade.refresh = function () {
  
            blade.isLoading = true;

            if ($scope.pageSettings.currentPage !== 1)
                $scope.pageSettings.currentPage = 1;

            // var searchCriteria = getSearchCriteria();

            // listEntries.listitemssearch(
            //     searchCriteria,
            //     function (data) {
            //         transformByFilters(data.listEntries);
            //         blade.isLoading = false;
            //         $scope.pageSettings.totalItems = data.totalCount;
            //         $scope.items = data.listEntries;
            //         $scope.hasMore = data.listEntries.length === $scope.pageSettings.itemsPerPageCount;

            //         //Set navigation breadcrumbs
            //         setBreadcrumbs();
            //     });

            //reset state grid
            resetStateGrid();
        }

        function showMore() {
            if ($scope.hasMore) {

                ++$scope.pageSettings.currentPage;
                $scope.gridApi.infiniteScroll.saveScrollPercentage();
                blade.isLoading = true;

                // var searchCriteria = getSearchCriteria();

                // listEntries.listitemssearch(
                //     searchCriteria,
                //     function (data) {
                //         transformByFilters(data.listEntries);
                //         blade.isLoading = false;
                //         $scope.pageSettings.totalItems = data.totalCount;
                //         $scope.items = $scope.items.concat(data.listEntries);
                //         $scope.hasMore = data.listEntries.length === $scope.pageSettings.itemsPerPageCount;
                //         $scope.gridApi.infiniteScroll.dataLoaded();

                //         $timeout(function () {
                //             // wait for grid to ingest data changes
                //             if ($scope.gridApi.selection.getSelectAllState()) {
                //                 $scope.gridApi.selection.selectAllRows();
                //             }
                //         });

                //     });
            }
        }

        function getSearchCriteria()
        {
            var searchCriteria = {
                catalogId: blade.catalogId,
                categoryId: blade.categoryId,
                keyword: filter.keyword ? filter.keyword : undefined,
                searchInVariations: filter.searchInVariations ? filter.searchInVariations : false,
                responseGroup: 'withCategories, withProducts',
                sort: uiGridHelper.getSortExpression($scope),
                skip: ($scope.pageSettings.currentPage - 1) * $scope.pageSettings.itemsPerPageCount,
                take: $scope.pageSettings.itemsPerPageCount
            };
            return searchCriteria;
        }

        function resetStateGrid() {
            if ($scope.gridApi) {
                $scope.items = [];
                $scope.gridApi.selection.clearSelectedRows();
                $scope.gridApi.infiniteScroll.resetScroll(true, true);
                $scope.gridApi.infiniteScroll.dataLoaded();
            }
        }

        blade.setSelectedItem = function (listItem) {
            $scope.selectedNodeId = listItem.id;
        };

        $scope.selectItem = function (e, listItem) {
            blade.setSelectedItem(listItem);
            // var newBlade;
            // if (listItem.type === 'category') {
            //     var openNewBlade = e.ctrlKey || filter.keyword;
            //     newBlade = {
            //         id: 'itemsList' + (blade.level + (openNewBlade ? 1 : 0)),
            //         level: blade.level + (openNewBlade ? 1 : 0),
            //         mode: blade.mode,
            //         isBrowsingLinkedCategory: blade.isBrowsingLinkedCategory || $scope.hasLinks(listItem),
            //         breadcrumbs: blade.breadcrumbs,
            //         title: 'catalog.blades.categories-items-list.title',
            //         subtitle: 'catalog.blades.categories-items-list.subtitle',
            //         subtitleValues: listItem.name !== null ? { name: listItem.name } : '',
            //         catalogId: blade.catalogId || listItem.catalogId,
            //         categoryId: listItem.id,
            //         category: listItem,
            //         catalog: blade.catalog,
            //         disableOpenAnimation: true,
            //         controller: 'virtoCommerce.catalogModule.categoriesItemsListController',
            //         template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/categories-items-list.tpl.html'
            //     };

            //     if (openNewBlade) {
            //         bladeNavigationService.showBlade(newBlade, blade);
            //     } else {
            //         bladeNavigationService.closeBlade(blade, function () {
            //             bladeNavigationService.showBlade(newBlade, blade.parentBlade);
            //         });
            //     }
            // } else {
            //     newBlade = {
            //         id: "listItemDetail" + blade.mode,
            //         itemId: listItem.id,
            //         productType: listItem.productType,
            //         title: listItem.name,
            //         catalog: blade.catalog,
            //         controller: 'virtoCommerce.catalogModule.itemDetailController',
            //         template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/item-detail.tpl.html'
            //     };
            //     bladeNavigationService.showBlade(newBlade, blade);

            //     // setting current categoryId to be globally available
            //     bladeNavigationService.catalogsSelectedCategoryId = blade.categoryId;
            // }
        };

        var filter = blade.filter = $scope.filter = {};
        $scope.$localStorage = $localStorage;
        if (!$localStorage.exportSearchFilters) {
            $localStorage.exportSearchFilters = [{ name: 'export.blades.export-generic-viewer.labels.new-filter' }];
        }
        if ($localStorage.exportSearchFilterId) {
            filter.current = _.findWhere($localStorage.exportSearchFilters, { id: $localStorage.exportSearchFilterId });
        }

        filter.change = function () {
            $localStorage.exportSearchFilterId = filter.current ? filter.current.id : null;
            if (filter.current && !filter.current.id) {
                filter.current = null;
                showFilterDetailBlade({ isNew: true });
            } else {
                bladeNavigationService.closeBlade({ id: 'filterDetail' });
                filter.criteriaChanged();
            }
        };

        filter.edit = function () {
            if (filter.current) {
                showFilterDetailBlade({ data: filter.current });
            }
        };

        function showFilterDetailBlade(bladeData) {
            var newBlade = {
                id: 'filterDetail',
                controller: 'virtoCommerce.exportModule.filterDetailController',
                template: 'Modules/$(VirtoCommerce.Export)/Scripts/blades/filter-detail.tpl.html'
            };
            angular.extend(newBlade, bladeData);
            bladeNavigationService.showBlade(newBlade, blade);
        }

        filter.criteriaChanged = function () {
            if ($scope.pageSettings.currentPage > 1) {
                $scope.pageSettings.currentPage = 1;
            } else {
                blade.refresh();
            }
        };

        blade.toolbarCommands = [{
            name: 'platform.commands.pick-selected',
            icon: 'fa fa-save',
            canExecuteMethod: function () {
                return blade.notification && !blade.notification.finished;
            },
            executeMethod: function () {
                if (blade.onCompleted) {
                    blade.onCompleted();
                }
            }
        }, {
            name: 'platform.commands.select-all',
            icon: 'fa fa-check-square-o',
            canExecuteMethod: function () {
                return blade.notification && !blade.notification.finished;
            },
            executeMethod: function () {
                if (blade.onCompleted) {
                    blade.onCompleted();
                }
            }
        }, {
            name: "platform.commands.refresh",
            icon: 'fa fa-refresh',
            executeMethod: blade.refresh,
            canExecuteMethod: function () {
                return true;
            }
        }, {
            name: 'platform.commands.cancel',
            icon: 'fa fa-times',
            canExecuteMethod: function () {
                return blade.notification && !blade.notification.finished;
            },
            executeMethod: function () {
                exportApi.cancel({ jobId: blade.notification.jobId }, function (data) {
                });
            }
        }];

        $scope.setGridOptions = function (gridOptions) {

            //disable watched
            bladeUtils.initializePagination($scope, true);
            //сhoose the optimal amount that ensures the appearance of the scroll
            $scope.pageSettings.itemsPerPageCount = 20;

            uiGridHelper.initialize($scope, gridOptions, function (gridApi) {
                //update gridApi for current grid
                $scope.gridApi = gridApi;

                uiGridHelper.bindRefreshOnSortChanged($scope);
                $scope.gridApi.infiniteScroll.on.needLoadMoreData($scope, showMore);
            });
        };

        initializeBlade();
    }]);
