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

            $.getJSON('http://'+CARTODB_USER+'.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM '+CARTODB_DB+' WHERE needs_more_info IS NULL OR needs_more_info = false', function (data) {
                L.geoJson(data, {

                    onEachFeature: function (featureData, layer) {
                        // format dates to string
                        featureData.properties._formated_evictability_date = featureData.properties._14_evictability_date ? featureData.properties._14_evictability_date.toString().split('T')[0] : undefined;
                        featureData.properties._formated_eviction_date = featureData.properties._10_eviction_date ? featureData.properties._10_eviction_date.toString().split('T')[0] : undefined;
                        featureData.properties._formated_opening_date = featureData.properties._09_opening_date ? featureData.properties._09_opening_date.toString().split('T')[0] : undefined;

                        // links string list to array
                        featureData.properties._links = featureData.properties._17_links ? featureData.properties._17_links.split(' ') : [];

                        // precompile
                        var source = $('#popup-template').html();
                        var template = Handlebars.compile(source);
                        var content = template({
                            place: featureData
                        });
                        layer.bindPopup(content, {
                            minWidth: 300,
                            maxHeight: 450
                        });
                    },

                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, instance.style);
                    },

                }).addTo(instance.map);
            });

        },

        openFeaturePopup: function (cartodbid) {
            var instance = this;
            instance.map.eachLayer(function (layer) {
                // Wrapped in try {} because this will see all layers, even
                // those that do not represent features
                try {
                    if (layer.feature.properties.cartodb_id === cartodbid) {
                        layer.openPopup();
                    }
                }
                catch (e) { }
            });
        }

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


function getQueryUrl(query) {
    var baseUrl = 'http://'+CARTODB_USER+'.cartodb.com/api/v2/sql?format=GeoJSON&';
    return baseUrl + 'q=' + query;
}



function showCurrentList(list) {
    var source = $('#current-list-template').html();
    var template = Handlebars.compile(source);
    $('#current-list-wrapper').html(template({
        places: list,
    }));
    $('.view-squat').click(function () {
        $('#map').data('freespacemap').openFeaturePopup($(this).data('cartodbid'));
        return false;
    });
}


function addCurrentList() {
    var query = 'SELECT * ' +
        'FROM '+CARTODB_DB+' ' +
        'ORDER BY _01_name_of_squat';

    var places = [];
    $.getJSON(getQueryUrl(query), function (data) {
        places = data.features;
        showCurrentList(places);
    });

    $('#current-list-filter-input').keyup(function () {
        var filteredPlaces = places;
        var filterText = $(this).val().toLowerCase();
        if (filterText && filterText !== '') {
            filteredPlaces = _.filter(places, function (place) {
                try {
                    return place.properties._01_name_of_squat.toLowerCase().indexOf(filterText) >= 0;
                }
                catch (e) {
                    return false;
                }
            });
        }
        showCurrentList(filteredPlaces);
    });
}


function setContentHeight() {
    var availableHeight = $(window).height() - $('#header').outerHeight() - $('.nav-tabs').outerHeight() -30;
    $('.tab-content').outerHeight(availableHeight);
}


Handlebars.registerHelper('urlize', function (text) {
    var urlPattern = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([!\/\w\.-]*)*\/?/g;
    var toUrl = function (match) {
        return '<a href="' + match + '" target="_blank">' + match + '</a>';
    };
    result = text.replace(urlPattern, toUrl);
    return new Handlebars.SafeString(result);
});


$(document).ready(function () {
    $('#map').freespacemap({});
    addCurrentList();
    setContentHeight();
    initCity();
});


$(window).smartresize(setContentHeight);


function initCity(){
    // Name
    $('#city-name').text(CITY);
    // Mail
    $('#mail-contact').html( '<a href="mailto:'+MAIL+'">'+MAIL+'</a>' );
    // Page title
    $('title').text( $('title').text()+CITY );
    // Raw data
    $('#raw-data-link').attr('href','http://'+CARTODB_USER+'.cartodb.com/api/v2/sql?format=csv&q=SELECT%20*%20FROM%20'+CARTODB_DB+'%20ORDER%20BY%20_01_name_of_squat');
    //
}