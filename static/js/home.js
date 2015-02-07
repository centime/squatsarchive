var CARTODB_USER = 'squatsarchive';
var CARTODB_DB = 'cities';

var MAP_CENTER = [47.21956811, 9.4921875] ;
var MAP_ZOOM = 5 ;

(function (window, $, undefined) {
    "use strict";

    $.freespacemap = function (options, element) {
        this.element = $(element);
        if (!this._create(options)) {
            this.failed = true;
        }
    };

    $.freespacemap.defaults = {
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        // leafletApiKey: '781b27aa166a49e1a398cd9b38a81cdf',
        // leafletStyleId: '9986',
    };

    $.freespacemap.prototype = {

        map: null,

        style: {
            fillColor: '#000',
            fillOpacity: 1,
            radius: 4,
            color: '#FFF',
            opacity: 1
        },

        _create: function (options) {
            // Add custom options to defaults
            var opts = $.extend(true, {}, $.freespacemap.defaults, options);
            this.options = opts;
            var $window = $(window);
            var instance = this;

            instance._initializeMap();

            return true;
        },

        _initializeMap: function () {
            var instance = this;

            instance.map = L.map('map', {
                center: instance.options.center,
                zoom: instance.options.zoom,
                zoomControl: false
            });

            // add tile layer

            L.tileLayer('http://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
//            L.tileLayer('https://{s}.tiles.mapbox.com/v3/ebrelsford.i0p8plmg/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18,
            }).addTo(instance.map);

            $.getJSON('http://'+CARTODB_USER+'.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM '+CARTODB_DB, function (data) {
                L.geoJson(data, {

                    onEachFeature: function (featureData, layer) {
                       layer.on('click', function (e) {
                            document.location = featureData.properties.map_url;
                        });
                    },

                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, instance.style);
                    },

                }).addTo(instance.map);
            });

        },

    };

    $.fn.freespacemap = function (options) {
        var thisCall = typeof options;

        switch (thisCall) {

        // method 
        case 'string':
            var args = Array.prototype.slice.call(arguments, 1);
            var instance = $.data(this[0], 'freespacemap');

            if (!instance) {
                // not setup yet
                return $.error('Method ' + options +
                    ' cannot be called until freespacemap is setup');
            }

            if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                return $.error('No such method ' + options + ' for freespacemap');
            }

            // no errors!
            return instance[options].apply(instance, args);
            break;

            // creation 
        case 'object':

            this.each(function () {
                var instance = $.data(this, 'freespacemap');

                if (instance) {
                    // update options of current instance
                    instance.update(options);
                } else {
                    // initialize new instance
                    instance = new $.freespacemap(options, this);

                    // don't attach if instantiation failed
                    if (!instance.failed) {
                        $.data(this, 'freespacemap', instance);
                    }
                }
            });

            break;
        }

        return this;
    };

})(window, jQuery);


function setCoverHeight(){
    var h = $(window).height() - $('header').outerHeight() - 170;
    $('.cover').each( function(){ $(this).outerHeight(h) ;});
}


$(document).ready(function () {
    $('#map').freespacemap({});
    setCoverHeight();
});


$(window).smartresize(setCoverHeight);
