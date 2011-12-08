(function () {
    "use strict";

    function Controller() {

        function add_sites(sites) {
            var that = this;

            that.send_working();
            for (var i in sites) {
                var site = sites[i];
                that.model.sites.push(site);
            }
            // pretend like this takes time purpotional to the number of sites
            // added
            setTimeout(function () {
                that.send_success();
            }, 100 * sites.length);
        }

        function remove_last() {
            this.send_working();
            this.model.sites.pop();
            this.send_success();
        }

        function clear_all() {
            this.send_working();
            this.model.sites = [];
            this.send_success();
        }

        function fake_error() {
            var that = this;

            that.send_working();
            this.model.sites = [];
            // pretend like this takes a while
            setTimeout(function () {
                that.send_error('timeout', 
                    'timeout in pretending to talk to server');
            }, 1000);
        }

        var controller = nano.Controller();
        return $.extend(controller, {
            add_sites: add_sites,
            remove_last: remove_last,
            clear_all: clear_all,
            fake_error: fake_error
        });
    }

    function ControlsView() {
        
        var $control_buttons = $('#controls button');
        var $spinner = $('#controls img');

        function child_init(controller) {

            $('#add-one').on('click', function () {
                controller.add_sites([{
                    name: 'Name', 
                    url: 'http://www.name.com'
                }]);
            });

            $('#add-some').on('click', function () {
                controller.add_sites([{
                    name: 'Some 1', 
                    url: 'http://www.some-one.com'
                }, {
                    name: 'Some 2', 
                    url: 'http://www.some-two.com'
                }, {
                    name: 'Some 3', 
                    url: 'http://www.some-three.com'
                }, {
                    name: 'Some 4', 
                    url: 'http://www.some-four.com'
                }, {
                    name: 'Some 5', 
                    url: 'http://www.some-five.com'
                }]);
            });

            $('#remove-last').on('click', function () {
                controller.remove_last();
            });

            $('#clear-all').on('click', function () {
                controller.clear_all();
            });

            $('#fake-error').on('click', function () {
                controller.fake_error();
            });
        }

        function success(controller, type) {
            $spinner.hide();
            $control_buttons.removeAttr('disabled');
        }

        function error(controller, type) {
            $spinner.hide();
            $control_buttons.removeAttr('disabled');
        }

        function working(controller, type) {
            $control_buttons.attr('disabled', 'disabled');
            $spinner.show();
        }

        var view = nano.View();
        return $.extend(view, {
            child_init: child_init,
            success: success,
            error: error,
            working: working
        });
    }

    function SiteSummaryView() {
        
        var $site_count = $('#site-count');
        var $longest_name = $('#longest-name');
        var $longest_url = $('#longest-url');

        function success(controller, type) {
            var sites = controller.model.sites;
            $site_count.html(sites.length);

            var longest_name = 0;
            var longest_url = 0;
            for (var i in sites) {
                var site = sites[i];
                if (site.name.length > longest_name) {
                    longest_name = site.name.length;
                }
                if (site.url.length > longest_url) {
                    longest_url = site.url.length;
                }
            }
            $longest_name.html(longest_name || '');
            $longest_url.html(longest_url || '');
        }

        function error(controller, type) {
            // this widget shows 0 when there's an error and turns the
            // background red (by adding a class)
            $site_count.addClass('error').html(0);
        }

        function working(controller, type) {
            $site_count.removeClass('error').html('');
            $longest_name.html('');
            $longest_url.html('');
        }

        var view = nano.View();
        return $.extend(view, {
            success: success,
            error: error,
            working: working
        });
    }

    function SiteListView() {
        
        var $site_list_ul = $('#site-list ul');

        function success(controller, type) {
            var html = '';
            var sites = controller.model.sites;
            for (var i in sites) {
                var site = sites[i];
                html += '<li><a href="' + site.url + '">' + site.name + 
                        '</a></li>';
            }
            $site_list_ul.html(html);
        }

        function working(controller, type) {
            $site_list_ul.html('');
        }

        var view = nano.View();
        return $.extend(view, {
            success: success,
            working: working
        });
    }

    function ErrorView() {
        
        var $error = $('#error');
        var $error_message = $error.find('div');

        $error.on('click', 'button', function () {
            $error.hide();
        });

        function error(controller, type) {
            $error_message.html(controller.error.message)
            $error.show();
        }

        function working(controller, type) {
            $error.hide();
        }

        var view = nano.View();
        return $.extend(view, {
            error: error,
            working: working
        });
    }

    function init(model) {
        var controller = new Controller();

        var controlsView = new ControlsView();
        controlsView.init(controller);

        var siteSummaryView = new SiteSummaryView();
        siteSummaryView.init(controller);

        var siteListView = new SiteListView();
        siteListView.init(controller);

        var errorView = new ErrorView();
        errorView.init(controller);

        controller.init(model);
    }

    window.demo = {
        init: init,
    };
}());
