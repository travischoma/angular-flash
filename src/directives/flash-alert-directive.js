/* global angular */

(function () {
    'use strict';

    function isBlank(str) {
        if (str === null || str === undefined) {
            str = '';
        }
        return (/^\s*$/).test(str);
    }

    function flashAlertDirective(flash, $interval) {
        return {
            scope: true,
            link: function ($scope, element, attr) {
                var timeoutHandle, subscribeHandle;

                $scope.flash = {};

                $scope.hide = function () {
                    $scope.flash = {};
                    removeAlertClasses();
                    if (!isBlank(attr.activeClass)) {
                        element.removeClass(attr.activeClass);
                    }
                };

                $scope.$on('$destroy', function () {
                    flash.clean();
                    flash.unsubscribe(subscribeHandle);
                });

                function removeAlertClasses() {
                    var classnames = [].concat(flash.classnames().error, flash.classnames().warn, flash.classnames().info, flash.classnames().success);
                    angular.forEach(classnames, function (clazz) {
                        element.removeClass(clazz);
                    });
                }

                function show(message, type) {
                    if (timeoutHandle) {
                        $interval.cancel(timeoutHandle);
                    }

                    $scope.flash.type = type;
                    $scope.flash.message = message;
                    removeAlertClasses();
                    angular.forEach(flash.classnames()[type], function (clazz) {
                        element.addClass(clazz);
                    });

                    if (!isBlank(attr.activeClass)) {
                        element.addClass(attr.activeClass);
                    }

                    var delay = Number(attr.duration || 5000);
                    if (delay > 0) {
                        timeoutHandle = $interval($scope.hide, delay, 1);
                    }
                }

                subscribeHandle = flash.subscribe(show, attr.flashAlert, attr.flashId);

                /**
                 * Fixes timing issues: display the last flash message sent before this directive subscribed.
                 */

                if (attr.flashAlert && flash[attr.flashAlert]()) {
                    show(flash[attr.flashAlert](), attr.flashAlert);
                }

                if (!attr.flashAlert && flash.message()) {
                    show(flash.message(), flash.type());
                }

            }
        };
    }

    angular.module('angular-flash.flash-alert-directive', ['angular-flash.service'])
        .directive('flashAlert', ['flash', '$interval', flashAlertDirective]);

}());
