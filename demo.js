(function () {
    "use strict";

    function Controller() {

        var id = 0;

        function add_sites(sites) {
            var that = this;

            that.send_working();
            for (var i in sites) {
                var site = sites[i];
                site.id = id++;
                that.model.sites.push(site);
            }
            // pretend like this takes time proportional to the number of sites
            // added
            setTimeout(function () {
                that.send_success();
            }, 100 * sites.length);
        }

        function remove_last() {
            this.send_working();
            var site = this.model.sites.pop();
            if (this.model.current_site && 
                site.id === this.model.current_site.id) {
                this.model.current_site = undefined;
            }
            this.send_success();
        }

        function clear_all() {
            this.send_working();
            this.reset();
            this.send_success();
        }

        function fake_error() {
            var that = this;

            that.send_working();
            this.reset();
            // pretend like this takes a while
            setTimeout(function () {
                that.send_error('timeout', 
                    'timeout in pretending to talk to server');
            }, 1000);
        }

        function get_site_details(site_id) {
            site_id = parseInt(site_id);
            this.send_working();
            var sites = this.model.sites;
            for (var i in sites) {
                var site = sites[i];
                if (site.id === site_id) {
                    if (!site.visits) {
                        // pretend like we're making an ajax request to get
                        // site details
                        site.visits = Math.ceil(Math.random() * 1000);
                    }
                    this.model.current_site = site;
                    break;
                }
            }
            this.send_success();
        }

        function reset() {
            this.model.sites = [];
            this.model.current_site = undefined;
        }

        var controller = nano.Controller();
        return $.extend(controller, {
            add_sites: add_sites,
            remove_last: remove_last,
            clear_all: clear_all,
            fake_error: fake_error,
            get_site_details: get_site_details,

            reset: reset
        });
    }

    function ControlsView() {
        
        var $control_buttons = $('#controls button');
        var $adding_buttons = $('#controls .adding');
        var $removing_buttons = $('#controls .removing');
        var $fake_error = $('#fake-error');
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

        function complete(controller, type) {
            $spinner.hide();
            $adding_buttons.removeAttr('disabled');
            if (controller.model.sites.length > 0) {
                $removing_buttons.removeAttr('disabled');
            }
            $fake_error.removeAttr('disabled');
        }

        function working(controller, type) {
            $control_buttons.attr('disabled', 'disabled');
            $spinner.show();
        }

        var view = nano.View();
        return $.extend(view, {
            child_init: child_init,
            // we're reusing the same handler for both success and error here
            success: complete,
            error: complete,
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
            // because we clear everything in working, there's no need to here.
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

        function child_init(controller) {
            $site_list_ul.on('click', 'a', function (evt) {
                evt.preventDefault();
                var site_id = $(evt.target).attr('site_id');
                controller.get_site_details(site_id);
            });
        }

        function complete(controller, type) {
            var html = '';
            var sites = controller.model.sites;
            for (var i in sites) {
                var site = sites[i];
                html += '<li><a site_id="' + site.id + '" href="#">' + 
                        site.name + '</a></li>';
            }
            $site_list_ul.html(html);
        }

        function working(controller, type) {
        }

        var view = nano.View();
        return $.extend(view, {
            child_init: child_init,
            // in either case we'll update to match the model
            success: complete,
            error: complete,
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
            // working clears us, so no need for success
            error: error,
            working: working
        });
    }

    function SiteDetailsView() {
        
        var $site_details = $('#site-details');
        var $site_name = $('#site-name');
        var $site_url = $('#site-url');
        var $site_visits = $('#site-visits');

        function success(controller, type) {
            var site = controller.model.current_site;
            if (site) {
                $site_name.html(site.name);
                $site_url.html(site.url);
                $site_visits.html(site.visits);
                $site_details.show();
            } else {
                $site_details.hide();
            }
        }

        function error(controller, type) {
            $site_details.hide();
        }

        var view = nano.View();
        return $.extend(view, {
            success: success,
            error: error
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

        var siteDetailsView = new SiteDetailsView();
        siteDetailsView.init(controller);

        controller.init(model);
    }

    window.demo = {
        init: init,
    };
}());
