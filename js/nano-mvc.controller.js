(function () {

    function Controller() {
        var subscribers = [];

        // TODO: switch this out for a real pub/sub impl if/when we use one
        function subscribe(callback) {
            subscribers.push(callback);
        }

        /** Notify all of our subscribers about an event that just happened.
         * @param: dataSource - the datasource object
         * @param: type - the type of event that happened, the rest of the
         * parameters will depend on the type of event.
         *
         * type update:
         *  a param change has been made and new data will be fetched
         *      args: the new params
         * type success:
         *  the new request has returned and data has been updated
         *      args: the jQuery XHR object
         * type error:
         *  the new request has returned, but data is still the old data,
         *  check out the jqXHR object to see what happened
         *      args: the jQuery XHR object
         */
        function publish() {
            // we'll pass along whatever args we recieved to the
            // subscribers
            var args = Array.prototype.slice.call(arguments);
            // after adding the datasource as the first param
            args.unshift(this);
            for (var i in subscribers) {
                subscribers[i].apply(this, args);
            }
        }

        function init(model) {

            // initialize the model based on whatever state we have, it'll come
            // in from the page and we'll muck with it to turn those options in
            // to the mode. for now it's just a straight assignment.
            this.model = options;
            
            // once the model is ready we'll call success and everyone should
            // update to the current state.
            this.send_success();
        }

        function send_success() {
            this.model.error = undefined;
            publish.call(this, 'success');
        }

        function send_error(type, message) {
            this.model.error = {
                type: type,
                message: message
            };

            publish.call(this, 'error', type);
        }

        function send_working(type) {
            publish.call(this, 'working', type);
        }

        return {
            model: {},

            subscribe: subscribe,
            send_success: send_success,
            send_error: send_error,
            send_working: send_working,

            init: init,
        };
    }

    nano = window.nano || {};
    $.extend(nano, {
        Controller: Controller
    });
}());
