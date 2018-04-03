window.$ = window.jQuery = require('jquery');
var Inputmask = require('inputmask');

var APIURL = '/admin/api';

window.quickOrder = {
    init: function() {
        console.log('QuickOrder!');
        this.setMasks();
        this.declarations();
        this.listProducts();
        this.listStates();
        this.startMaps();
    },

    map: null,
    markers: [],
    search: document.getElementById('search'),
    searchBox: null,
    adress: {},

    canRefreshCity: true,
    canRefreshNeighborhood: true,
    productsList: '.products-list',
    productsListItem: '.products-list .list-group-item',
    orderProductsList: '.order-products-list',
    orderProductsListItem: '.order-products-list .list-group-item',

    startMaps: function() {
        var self = this;
        var porto_alegre = {lat: (window.lat ? window.lat :-30.0426525), lng: (window.lang ? window.lang : -51.1816439)};
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: porto_alegre,
            zoom: 12,
            mapTypeId: 'roadmap'
        });

        this.searchBox = new google.maps.places.SearchBox(document.getElementById('search'));
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.search);

        this.map.addListener('bounds_changed', function() {
            self.searchBox.setBounds(self.map.getBounds());
        });
        this.searchBox.addListener('places_changed', function() {
            var places = self.searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            console.log('PLACE', places[0]);
            if (!places[0].address_components) {
                $('#search').val(places[0].name);
                return;
            }
            self.setPlaces(places[0]);

            // Clear out the old markers.
            self.markers.forEach(function(marker) {
                marker.setMap(null);
            });

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }

                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                self.markers[0] = new google.maps.Marker({
                    map: self.map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                });

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            self.map.fitBounds(bounds);
        });
    },

    setPlaces: function(place) {
        var self = this;
        var components = place.address_components;

        self.adress = {
            state: self.getAddressComponentsValues(components, "administrative_area_level_1"),
            city: self.getAddressComponentsValues(components, "administrative_area_level_2"),
            neighborhood: self.getAddressComponentsValues(components, "sublocality_level_1"),
            street: self.getAddressComponentsValues(components, "route"),
            lat: place.geometry.location.lat(),
            long: place.geometry.location.lng()
        };

        self.setState(self.adress.state);
        self.setCity(self.adress.city);
        self.setNeighborhood(self.adress.neighborhood);
        window.lat = self.adress.lat;
        window.long = self.adress.long;
        document.getElementById('adress').value = self.adress.street.long_name;
        $('#number').focus();
    },

    setCenterMap: function(coordinates) {
        window.lat = coordinates.lat;
        window.lng = coordinates.lng;
        this.map.setCenter(coordinates);
        this.map.setZoom(16);

        this.markers.forEach(function(marker) {
            marker.setMap(null);
        });

        this.markers[0] = new google.maps.Marker({
            map: this.map,
            icon: '',
            title: '',
            position: coordinates
        });
    },

    setState: function(state) {
        var self = this;
        if (state) {
            var found = false;
            $('#state option').each(function() {
                if ($(this).text().toUpperCase().indexOf(state.long_name.toUpperCase()) != -1) {
                    $('#state').val($(this).val()).trigger('change');
                    found = true;
                }
            });

            if (!found) {
                $.ajax({
                    async: false,
                    type: 'POST',
                    url: APIURL + '/states',
                    data: state,
                    success: function(state) {
                        self.listStates(state.id);
                    },
                    error: function(err) {
                        console.log(err);
                    }
                })
            }
        } else {
            $('#state').val('').trigger('change');
        }
    },

    setCity: function(city) {
        var self = this;
        if (city) {
            var found = false;
            $('#city option').each(function () {
                if ($(this).text().toUpperCase().indexOf(city.long_name.toUpperCase()) != -1) {
                    $('#city').val($(this).val()).trigger('change');
                    found = true;
                }
            });

            if (!found) {
                city.state_id = $('#state').val();
                $.ajax({
                    async: false,
                    type: 'POST',
                    url: APIURL + '/cities',
                    data: city,
                    success: function(city) {
                        self.listCities(city.state_id, city.id);
                    },
                    error: function(err) {
                        console.log(err);
                    }
                })
            }
        } else {
            $('#city').val('').trigger('change');
        }
    },

    setNeighborhood: function(neighborhood) {
        var self = this;
        if (neighborhood) {
            var found = false;
            $('#neighborhood option').each(function () {
                if ($(this).text().toUpperCase().indexOf(neighborhood.long_name.toUpperCase()) != -1) {
                    $('#neighborhood').val($(this).val()).trigger('change');
                    found = true;
                }
            });

            if (!found) {
                neighborhood.city_id = $('#city').val();
                $.ajax({
                    async: false,
                    type: 'POST',
                    url: APIURL + '/neighborhoods',
                    data: neighborhood,
                    success: function(neighborhood) {
                        self.listNeighborhoods(neighborhood.city_id, neighborhood.id);
                    },
                    error: function(err) {
                        console.log(err);
                    }
                })
            }
        } else {
            $('#neighborhood').val('').trigger('change');
        }
    },

    getAddressComponentsValues: function(components, type) {
        var content = '';
        components.forEach(function(value) {
            if (value.types.indexOf(type) != -1) {
                content = value;
            }
        });

        return content;
    },

    setMasks: function() {
        Inputmask({mask: "(99) 9 9999-999[9]"}).mask('.phone');
        Inputmask({mask: "*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}[.*{2,6}][.*{1,2}]"}).mask('.email');
    },

    setProductListItem: function(quantity, id, name, value) {
        return '<a href="#" ondragstart="return false;" class="list-group-item list-group-item-action" '+(quantity > 0 ? '': 'disabled="disabled"')+' data-id="'+id+'" data-quantity="'+quantity+'" data-value="'+value+'"><span class="name">'+name+'</span><i class="voyager-plus"></i><span class="badge badge-primary badge-pill">'+quantity+'</span></a>';
    },

    setOrderProductListItem: function(quantity, id, name, value) {
        return '<a href="#" ondragstart="return false;" class="list-group-item list-group-item-action" data-id="'+id+'" data-quantity="'+quantity+'" data-value="'+value+'"><span class="name">'+name+'</span><i class="voyager-x"></i><span class="badge badge-primary badge-pill">'+quantity+'</span></a>';
    },

    declarations: function() {
        this.onBlurPhone();
        this.onChangeState();
        this.onChangeCity();
        this.onAddProduct();
        this.onRemoveProduct();
        this.onSubmit();
        this.onCheckEnter();
        this.onBtnClear();
    },

    listProducts: function () {
        var self = this;
        $(self.productsList).html('');
        $.ajax({
            url: APIURL + '/products',
            success: function(products) {
                products.forEach(function(product) {
                    $(self.productsList).append(self.setProductListItem(product.quantity, product.id, product.name, product.value));
                });
            }
        })
    },

    listStates: function (activeId) {
        var self = this;
        $('#state option').not('[value=""]').remove();
        $.ajax({
            url: APIURL + '/states',
            success: function(states) {
                states.forEach(function(state) {
                    $('#state').append('<option value="'+state.id+'" data-slug="'+state.slug+'">'+state.name+'</option>');
                });

                if (activeId) {
                    self.canRefreshCity = false;
                    $('#state').val(activeId).trigger('change');
                }
            }
        })
    },

    listCities: function (stateId, activeId) {
        var self = this;
        $('#city option').not('[value=""]').remove();
        if (stateId) {
            $.ajax({
                async: false,
                url: APIURL + '/cities/byState/' + stateId,
                success: function(cities) {
                    cities.forEach(function(city) {
                        $('#city').append('<option value="'+city.id+'">'+city.name+'</option>');
                    });

                    if (activeId) {
                        $('#city').val(activeId).trigger('change');
                    }
                }
            });
        }
    },

    listNeighborhoods: function (cityId, activeId) {
        var self = this;
        $('#neighborhood option').not('[value=""]').remove();
        if (cityId) {
            $.ajax({
                async: false,
                url: APIURL + '/neighborhoods/byCity/' + cityId,
                success: function(neighborhoods) {
                    neighborhoods.forEach(function(neighborhood) {
                        $('#neighborhood').append('<option value="'+neighborhood.id+'">'+neighborhood.name+'</option>');
                    });

                    if (activeId) {
                        $('#neighborhood').val(activeId).trigger('change');
                    }
                }
            });
        }
    },

    onChangeState: function() {
        var self = this;
        $('#state').change(function() {
            if (self.canRefreshCity) {
                self.listCities($(this).val());
            }
            self.canRefreshCity = true;
        });
    },

    onChangeCity: function() {
        var self = this;
        $('#city').change(function() {
            if (self.canRefreshNeighborhood) {
                self.listNeighborhoods($(this).val());
            }
            self.canRefreshNeighborhood = true;
        });
    },

    onBtnClear: function() {
        var self = this;
        $('#btnClear').click(function (e) {
            e.preventDefault();
            self.clearForm();
        });
    },

    onAddProduct: function() {
        var self = this;
        $(document).on('click', self.productsListItem, function(e) {
            e.preventDefault();

            var id = $(this).data('id'),
                name = $(this).find('span').html(),
                value = $(this).data('value');

            var quantity = document.querySelector(self.productsListItem+'[data-id="'+id+'"]').getAttribute('data-quantity')-1;
            if (parseInt(document.querySelector(self.productsListItem+'[data-id="'+id+'"] .badge').innerHTML) <= 0) {
                return;
            }
            document.querySelector(self.productsListItem+'[data-id="'+id+'"]').setAttribute('data-quantity', quantity);
            document.querySelector(self.productsListItem+'[data-id="'+id+'"] .badge').innerHTML = quantity;

            if (quantity <= 0) {
                $(this).attr('disabled', 'disabled');
            }

            if ($(self.orderProductsListItem+'[data-id="'+id+'"]').length) {
                var orderProductQuantity = parseInt(document.querySelector(self.orderProductsListItem+'[data-id="'+id+'"] .badge').innerHTML) +1;
                document.querySelector(self.orderProductsListItem+'[data-id="'+id+'"]').setAttribute('data-quantity', orderProductQuantity.toString());
                document.querySelector(self.orderProductsListItem+'[data-id="'+id+'"] .badge').innerHTML = orderProductQuantity;
            } else {
                document.querySelector(self.orderProductsList).innerHTML += self.setOrderProductListItem(1, id, name, value);
            }

            document.querySelector('.panel.pedido').classList.remove('invalid');
        });
    },

    onRemoveProduct: function() {
        var self = this;
        $(document).on('click', self.orderProductsListItem, function(e) {
            e.preventDefault();

            var id = $(this).data('id');

            var product = document.querySelector(self.productsListItem+'[data-id="'+id+'"]');

            var quantity = parseInt(product.getAttribute('data-quantity'))+1;
            product.setAttribute('data-quantity', quantity);
            var orderProductQuantity = parseInt(document.querySelector(self.orderProductsListItem+'[data-id="'+id+'"] .badge').innerHTML);
            document.querySelector(self.productsListItem+'[data-id="'+id+'"] .badge').innerHTML = quantity.toString();
            document.querySelector(self.orderProductsListItem+'[data-id="'+id+'"] .badge').innerHTML = orderProductQuantity - 1;
            document.querySelector(self.orderProductsListItem+'[data-id="'+id+'"]').setAttribute('data-quantity', orderProductQuantity - 1);

            if (quantity <= 0) {
                product.setAttribute('disabled', 'disabled');
            } else {
                product.setAttribute('disabled', 'false');
            }

            if (parseInt(document.querySelector(self.orderProductsListItem+'[data-id="'+id+'"] .badge').innerHTML) == 0) {
                $(this).remove();
            }

            document.querySelector('.panel.pedido').classList.remove('invalid');
        });
    },

    clearOrderProducts: function () {
        var self = this;
        document.querySelectorAll(this.orderProductsListItem).forEach(function(el) {
            var id = el.getAttribute('data-id'),
                elQuanqity = parseInt(el.getAttribute('data-quantity'));

            var product = document.querySelector(self.productsListItem+'[data-id="'+id+'"]');

            var quantity = parseInt(product.getAttribute('data-quantity'))+elQuanqity;
            product.setAttribute('data-quantity', quantity);
            var orderProductQuantity = parseInt(document.querySelector(self.orderProductsListItem+'[data-id="'+id+'"] .badge').innerHTML);
            document.querySelector(self.productsListItem+'[data-id="'+id+'"] .badge').innerHTML = quantity.toString();
            document.querySelector(self.orderProductsListItem+'[data-id="'+id+'"] .badge').innerHTML = orderProductQuantity - 1;

            if (quantity <= 0) {
                product.setAttribute('disabled', 'disabled');
            } else {
                product.setAttribute('disabled', 'false');
            }
        });


        $(this.orderProductsListItem).remove();
    },

    getOrderProducts: function() {
        var self = this;
        var products = [];
        document.querySelectorAll(self.orderProductsListItem).forEach(function(el, i) {
            products.push({
                id: el.getAttribute('data-id'),
                name: el.querySelector('.name').innerHTML,
                quantity: el.getAttribute('data-quantity')
            });
        });
        return products;
    },

    formValidate: function() {
        var phone_primary = document.querySelector("[name='phone_primary']");
        var state = document.querySelector("[name='state']");
        var city = document.querySelector("[name='city']");
        var neighborhood = document.querySelector("[name='neighborhood']");
        var number = document.querySelector("[name='number']");
        var adress = document.querySelector("[name='adress']");
        var products = this.getOrderProducts();
        var valid = true;

        if (!Inputmask.isValid(phone_primary.value, { mask: "(99) 9 9999-999[9]"})) {
            console.log('Telefone primário inválido');
            phone_primary.classList.add('invalid');
            valid = false;
        }

        if (!state.value.length) {
            console.log('Estado inválido');
            state.classList.add('invalid');
            valid = false;
        }

        if (!city.value.length) {
            console.log('Cidade inválida');
            city.classList.add('invalid');
            valid = false;
        }

        if (!neighborhood.value.length) {
            console.log('Bairro inválido');
            neighborhood.classList.add('invalid');
            valid = false;
        }

        if (!number.value) {
            console.log('Número inválido');
            number.classList.add('invalid');
            valid = false;
        }

        if (!adress.value) {
            console.log('Endereço inválido');
            adress.classList.add('invalid');
            valid = false;
        }

        if (!products.length) {
            console.log('Sem produtos adicionados');
            document.querySelector('.panel.pedido').classList.add('invalid');
            valid = false;
        }

        $('input').change(function () {
           $(this).removeClass('invalid');
        });

        return valid;
    },

    clearForm: function() {
        this.clearOrderProducts();
        document.querySelector("[name='phone_primary']").value = '';
        $("[name='neighborhood']").val('').trigger('change');
        $("[name='city']").val('').trigger('change');
        $("[name='state']").val('').trigger('change');
        document.querySelector("[name='adress']").value = '';
        document.querySelector("[name='number']").value = '';
        document.querySelector("[name='search']").value = '';
        document.querySelector("[name='name']").value = '';
        document.querySelector("[name='phone_secondary']").value = '';
        document.querySelector("[name='email']").value = '';

        $("[name='phone_primary']").focus();
    },

    onBlurPhone: function () {
        var self = this;
        $('[name=phone_primary]').blur(function() {
            var phone_primary = document.querySelector("[name='phone_primary']");
            if (Inputmask.isValid(phone_primary.value, { mask: "(99) 9 9999-999[9]"})) {
                $.ajax({
                    type: 'GET',
                    url: APIURL + '/customers/byPhone/' + phone_primary.inputmask.unmaskedvalue(),
                    success: function (customer) {
                        document.querySelector("[name='name']").value = customer.name;
                        document.querySelector("[name='phone_secondary']").value = customer.phone_secondary;
                        document.querySelector("[name='email']").value = customer.email;
                        $("[name='state']").val(customer.adress.state.id).trigger('change');
                        $("[name='city']").val(customer.adress.city.id).trigger('change');
                        $("[name='neighborhood']").val(customer.adress.neighborhood.id).trigger('change');
                        $("[name='adress']").val(customer.adress.adress);
                        $("[name='number']").val(customer.adress.number);
                        $("[name='search']").val(customer.adress.full_adress);
                        self.setCenterMap({lat: parseFloat(customer.adress.lat), lng: parseFloat(customer.adress.long)});
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            }
        });
    },

    onCheckEnter: function() {
        $('form').keypress(function(e) {
            e = e || event;
            var txtArea = /textarea/i.test((e.target || e.srcElement).tagName);
            return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
        });
    },

    onSubmit: function() {
        var self = this;
        $("form button[type=submit]").click(function (e) {
            e.preventDefault();

            var order = self.getFormValues();

            if (self.formValidate()) {
                console.log(order);

                $("form button[type=submit]").attr('disabled', 'disabled');

                $.ajax({
                    type: 'POST',
                    data: order,
                    url: APIURL + '/orders/quick',
                    success: function (response) {
                        self.clearForm();
                        self.listProducts();
                        console.log(response);
                        toastr.success('Pedido adicionado com sucesso!');
                        $("form button[type=submit]").removeAttr('disabled');
                    },
                    error: function (err) {
                        console.log(err);
                        toastr.error('Ocorrreu algum problema no envio do pedido. Informe ao desenvolvedor do site');
                        $("form button[type=submit]").removeAttr('disabled');
                    }
                })
            } else {
                toastr.warning('Formulário inválido. Verique os campos');
            }
        });
    },

    getFormValues: function() {
        var form = {
            phone_primary: document.querySelector("[name='phone_primary']").inputmask.unmaskedvalue(),
            products: this.getOrderProducts(),
            neighborhood_id: document.querySelector("[name='neighborhood']").value,
            adress: document.querySelector("[name='adress']").value,
            full_adress: document.querySelector("[name='search']").value,
            number: document.querySelector("[name='number']").value,
            lat: window.lat,
            long: window.long,
            name: document.querySelector("[name='name']").value,
            phone_secondary: document.querySelector("[name='phone_secondary']").inputmask.unmaskedvalue(),
            email: document.querySelector("[name='email']").value
        };
        return form;
    }
};

$(document).ready(function() {
    window.quickOrder.init();
});