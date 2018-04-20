window.$ = window.jQuery = require('jquery');
var Inputmask = require('inputmask');
window.moment = require('moment');
moment.locale('pt-br');

var APIURL = '/admin/api';

window.ordersList = [];
window.loader = {
    active: function() {
        $('#voyager-loader').css('display', 'block');
    },

    deactive: function() {
        $('#voyager-loader').css('display', 'none');
    }
}

window.quickOrder = {
    init: function() {
        console.log('QuickOrder!');
        this.setMasks();
        this.declarations();
        this.listProducts();
        this.listStates();
        this.listEmployees();
        this.listPaymentMethods();
        this.startMaps();
        this.listLastOrders();
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
        if (!window.google) {
            setTimeout(function(){}, 1000);
        }
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
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
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
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
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
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
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
        Inputmask({alias: "email"}).mask('.email');
        Inputmask({alias: "date", inputFormat: "dd/mm/yyyy", placeholder: "dd/mm/aaaa", clearIncomplete: true}).mask('.birth');
        Inputmask({mask: "999.999.999-99", clearIncomplete: true}).mask('.cpf');
    },

    setProductListItem: function(quantity, id, name, value, bg, txtColor) {
        return '<a href="#" ondragstart="return false;" class="list-group-item list-group-item-action" '+(quantity > 0 ? '': 'disabled="disabled"')+' data-id="'+id+'" data-quantity="'+quantity+'" data-value="'+value+'" style="background-color: '+(bg ? bg : '#FFF')+';"><span class="name" style="color: '+(txtColor ? txtColor :'#111')+' ">'+name+'</span><i class="voyager-plus"></i><span class="badge badge-primary badge-pill">'+quantity+'</span></a>';
    },

    setOrderProductListItem: function(quantity, id, name, value, bg, txtColor) {
        return '<a href="#" ondragstart="return false;" class="list-group-item list-group-item-action" data-id="'+id+'" data-quantity="'+quantity+'" data-value="'+value+'" style="background-color: '+(bg ? bg :'#FFF')+' "><span class="name" style="color: '+(txtColor ? txtColor :'#111')+' ">'+name+'</span><i class="voyager-x"></i><span class="badge badge-primary badge-pill">'+quantity+'</span></a><input type="text" data-id="'+id+'" class="form-control" value="" placeholder="Observação">';
    },

    declarations: function() {
        this.onBlurPhone();
        this.onChangeState();
        this.onChangeCity();
        this.onAddProduct();
        this.onRemoveProduct();
        this.onSubmit();
        this.onCheckEnter();
        this.onClickEditOrder();
        this.onBtnClear();
    },

    listLastOrders: function () {
        var self = this;
        $.ajax({
            url: APIURL + '/orders/list/10',
            success: function(orders) {
                $('.last-orders-list').html('');
                orders.forEach(function(order) {
                    $('.last-orders-list').append('<a href="#" class="list-group-item list-group-item-action" data-id="'+order.id+'">'+(order.customer.name ? order.id + ': ' +order.customer.name : order.id)+'</a>');
                });
            }
        });
    },

    listProducts: function () {
        var self = this;
        $(self.productsList).html('');
        $.ajax({
            url: APIURL + '/products',
            success: function(products) {
                products.forEach(function(product) {
                    $(self.productsList).append(self.setProductListItem(product.quantity, product.id, product.name, product.value, product.bg_color, product.text_color));
                });
            }
        })
    },

    listEmployees: function () {
        var self = this;
        $.ajax({
            url: APIURL + '/employees',
            success: function(employees) {
                employees.forEach(function(employee) {
                    $('#employee').append('<option value="' + employee.id + '">' + employee.name + '</option>');
                });
            }
        });
    },

    listPaymentMethods: function () {
        var self = this;
        $.ajax({
            url: APIURL + '/payment-methods',
            success: function(methods) {
                methods.forEach(function(methods) {
                    $('#paymentMethod').append('<option value="' + methods.id + '">' + methods.name + '</option>');
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

    onClickEditOrder: function() {
        var self = this;
        $(document).on('click', '.last-orders-list .list-group-item', function(e) {
            e.preventDefault();

            var order_id = e.target.dataset.id;
            if (order_id) {
                $.ajax({
                    url: APIURL + '/orders/find/' + order_id,
                    success: function(order) {
                        if (order) {
                            self.setOrderToEdit(order);
                        }
                    }
                });
            }
        });
    },

    setOrderToEdit: function(order) {
        var self = this;
        this.clearForm();
        document.querySelector("[name='phone_primary']").value = order.customer.phone_primary;
        this.setUser();
        $('.last-orders-list .list-group-item[data-id="'+order.id+'"]').addClass('editing');
        window.editing_order = order.id;

        order.order_products.forEach(function(product) {
            for (var i = 0; i < product.quantity; i++) {
                $(self.productsListItem+'[data-id="'+product.product_id+'"]').trigger('click');
            }

            if (product.observation) {
                setTimeout(function() {
                    document.querySelector('.order-products-list input[data-id="'+product.product_id+'"]').value = product.observation;
                },100)
            }
        });

        document.querySelector("[name='change']").value = order.change;
        $('#employee').val(order.employee_id).trigger('change');
        $('#paymentMethod').val(order.payment_method_id).trigger('change');
    },

    onAddProduct: function() {
        var self = this;
        $(document).on('click', self.productsListItem, function(e) {
            e.preventDefault();

            var id = $(this).data('id'),
                name = $(this).find('span').html(),
                bg = $(this).css('background-color'),
                txtColor = $(this).find('.name').css('color'),
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
                document.querySelector(self.orderProductsList).innerHTML += self.setOrderProductListItem(1, id, name, value, bg, txtColor);
            }

            document.querySelector('.panel.pedido').classList.remove('invalid');
            self.refreshOrderValue();
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
                $('input[data-id="'+id+'"]').remove();
                $(this).remove();
            }

            document.querySelector('.panel.pedido').classList.remove('invalid');
            self.refreshOrderValue();
        });
    },

    refreshOrderValue: function() {
        var total = 0.0;

        var products = document.querySelectorAll(this.orderProductsListItem);

        products.forEach(function(product) {
            total += product.dataset.quantity * product.dataset.value;
        });

        total = 'R$ ' + total.toFixed(2);
        total = total.replace('.', ',');
        $('.panel.pedido .panel-title .order-value').html(total);
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


        $(this.orderProductsListItem+', .order-products-list.list-group input').remove();
        $('.panel.pedido .panel-title .order-value').html('R$ 0,00');
    },

    getOrderProducts: function() {
        var self = this;
        var products = [];
        document.querySelectorAll(self.orderProductsListItem).forEach(function(el, i) {
            var id = el.getAttribute('data-id');
            products.push({
                id: id,
                name: el.querySelector('.name').innerHTML,
                quantity: el.getAttribute('data-quantity'),
                observation: document.querySelector('.order-products-list input[data-id="'+id+'"]').value
            });
        });
        return products;
    },

    formValidate: function() {
        var phone_primary = document.querySelector("[name='phone_primary']");
        var state = document.querySelector("[name='state']");
        var paymentMethod = document.querySelector("[name='paymentMethod']");
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

        if (!paymentMethod.value) {
            console.log('Método de Pagemento inválido');
            paymentMethod.classList.add('invalid');
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
        window.editing_order = null;
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
        $('#employee').val('').trigger('change');
        $('#paymentMethod').val('').trigger('change');
        document.querySelector("[name='change']").value = '';

        $('.last-orders-list .list-group-item').removeClass('editing');

        $("[name='phone_primary']").focus();

        $('input, select, .panel').removeClass('invalid');
    },

    onBlurPhone: function () {
        var self = this;
        $('[name=phone_primary]').blur(function() {
            if (!window.editing_order) {
                self.setUser();
            }
        });
    },

    setUser: function() {
        var self = this;
        var phone_primary = document.querySelector("[name='phone_primary']");
        if (Inputmask.isValid(phone_primary.value, { mask: "(99) 9 9999-999[9]"})) {
            $.ajax({
                type: 'GET',
                url: APIURL + '/customers/byPhone/' + phone_primary.inputmask.unmaskedvalue(),
                success: function (customer) {
                    if (customer) {
                        document.querySelector("[name='name']").value = (customer.name ? customer.name : '');
                        document.querySelector("[name='phone_secondary']").value = (customer.phone_secondary ? customer.phone_secondary : '');
                        document.querySelector("[name='email']").value = (customer.email ? customer.email : '');
                        document.querySelector("[name='birth']").value = (customer.birth ? moment(customer.birth).format('L') : '');
                        document.querySelector("[name='cpf']").value = (customer.cpf ? customer.cpf : '');

                        if (customer.adress) {
                            $("[name='state']").val(customer.adress.state ? customer.adress.state.id : '').trigger('change');
                            $("[name='city']").val(customer.adress.city ? customer.adress.city.id : '').trigger('change');
                            $("[name='neighborhood']").val(customer.adress.neighborhood ? customer.adress.neighborhood.id : '').trigger('change');
                            $("[name='adress']").val(customer.adress.adress ? customer.adress.adress : '');
                            $("[name='number']").val(customer.adress.number ? customer.adress.number : '');
                            $("[name='search']").val(customer.adress.full_adress ? customer.adress.full_adress : '');
                            if (customer.adress.lat && customer.adress.long) {
                                self.setCenterMap({lat: parseFloat(customer.adress.lat), lng: parseFloat(customer.adress.long)});
                            }
                        }
                    } else {
                        toastr.warning('Telefone do Cliente não encontrado. Finalize o pedido com os dados abaixo para cadastrá-lo');
                    }
                },
                error: function (err) {
                    console.log(err);
                    toastr.warning('Telefone do Cliente não encontrado. Finalize o pedido com os dados abaixo para cadastrá-lo');
                }
            });
        }
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
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    url: APIURL + '/orders/quick',
                    success: function (response) {
                        if (window.editing_order) {
                            toastr.success('Pedido ' + window.editing_order + ' editado com sucesso!');
                        } else {
                            toastr.success('Pedido adicionado com sucesso!');
                        }
                        self.clearForm();
                        self.listProducts();
                        console.log(response);
                        self.listLastOrders();
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
            id: window.editing_order,
            phone_primary: document.querySelector("[name='phone_primary']").inputmask.unmaskedvalue(),
            products: this.getOrderProducts(),
            payment_method_id: $('#paymentMethod').val(),
            employee_id: $('#employee').val(),
            change: document.querySelector("[name='change']").value,
            neighborhood_id: document.querySelector("[name='neighborhood']").value,
            adress: document.querySelector("[name='adress']").value,
            full_adress: document.querySelector("[name='search']").value,
            number: document.querySelector("[name='number']").value,
            lat: window.lat,
            long: window.long,
            name: document.querySelector("[name='name']").value,
            phone_secondary: document.querySelector("[name='phone_secondary']").inputmask.unmaskedvalue(),
            email: document.querySelector("[name='email']").value,
            cpf: document.querySelector("[name='cpf']").inputmask.unmaskedvalue(),
            birth: moment(document.querySelector("[name='birth']").value, 'DD-MM-YYYY').format('YYYY-MM-DD')
        };
        return form;
    }
};

window.orders = {
    init: function() {
        console.log('Orders!');
        this.getOrders(10);
        this.declarations();
        this.asyncRefresh();
    },

    declarations: function() {
        this.onClickCard();
        this.onSaveCard();
        this.onClickFilter();
        this.onChangeLimitOrders();
    },

    asyncRefresh: function() {
        var self = this;
        setInterval(function() {
            self.getOrders($('#filterOrdersLimit').val());
        }, 5000);
    },

    getOrders: function(limit) {
        var self = this;
        $.ajax({
            url: APIURL + '/orders/list' + (limit ? '/'+limit : ''),
            success: function(orders) {
                if (orders) {
                    window.ordersList = orders;
                    orders.forEach(function(order) {
                        self.insertOrder(order);
                    });
                }
                console.log('Pedidos: ', window.ordersList);
            }
        });
    },

    getOrderById: function(id) {
        var selectedOrder = false;
        if (window.ordersList.length) {
            window.ordersList.forEach(function(order) {
               if (order.id == id) {
                   selectedOrder = order;
               }
            });
        }
        return selectedOrder;
    },

    getOrderItens: function(order) {
        var items = '';
        var total = 0.00;
        order.order_products.forEach(function(product) {
            var id = product.product.id,
                name = product.product.name,
                quantity = parseInt(product.quantity),
                obs = product.observation ? 'class="obs"' : '',
                value = parseFloat(product.product.value).toFixed(2).replace('.',',');

            total += parseFloat(product.product.value)*quantity;

            items += '<li '+obs+' data-id="'+id+'">x'+quantity+' '+name+' R$ '+value+'</li>'
        });

        return {list: items, total: total};
    },

    insertOrder: function(order) {
        var $card = $('.card[data-id="'+order.id+'"]'),
            exists = true;
        if (!$card.length) {
            exists = false;
            $card = $('.card.sample').clone().removeClass('sample').css('display', 'inline-block');
        }

        $card.attr('data-status', order.status.toLowerCase());
        $card.attr('data-id', order.id);
        $card.find('.card-header .card-title').html('Pedido Nº <b>' + order.id + '</b>');

        if (order.order_products) {
            var items = this.getOrderItens(order);
            $card.find('.card-body .items').html(items.list);
            $card.find('.card-body .total').html('Total: R$ ' + parseFloat(items.total).toFixed(2).replace('.',','));
        }

        if (!exists) {
            $('#orders').append($card);
            setTimeout(function() {
                $card.addClass('active');
            }, 300);
        }

    },

    setCardModalOrder: function(order) {
        $('#cardModal .modal-title .order').html('Pedido Nº ' + order.id);
        $('#cardModal #print a').attr('href', 'pedidos/cupon/' + order.id);
        $('#cardModal').attr('data-id', order.id);
        $('#city').val(order.adress.city.name);
        $('#neighborhood').val(order.adress.neighborhood.name);
        $('#street').val(order.adress.adress);
        $('#number').val(order.adress.number);
        $('#complement').val('');
        var items = this.getOrderItens(order);
        $('#items').html(items.list);
        $('#total').val('R$ ' + parseFloat(items.total).toFixed(2).replace('.',','));
        $('#change').val('R$ ' + parseFloat(order.change ? order.change : 0).toFixed(2).replace('.',','));
        $('#name').val(order.customer.name);
        $('#phone_primary').val(order.customer.phone_primary);
        $('#phone_secondary').val(order.customer.phone_secondary);
        $('#employee').val(order.employee.name);
        $('#paymentMethod').val(order.payment_method.name);
        $('#email').val(order.customer.email);
        $('#status').val(order.status).trigger('change');
        order.order_products.forEach(function(oProduct) {
            if (oProduct.observation) {
                $('#items li[data-id="'+oProduct.product_id+'"]').append(' <b>Obs: '+oProduct.observation+'</b>');
            }
        });

        $('#cardModal').removeClass('modal-danger modal-warning modal-info modal-success');
        switch (order.status) {
            case 'APROVADO':
                $('#cardModal').addClass('modal-danger');
                break;
            case 'PRODUCAO':
                $('#cardModal').addClass('modal-warning');
                break;
            case 'EXPEDIDO':
                $('#cardModal').addClass('modal-info');
                break;
            case 'ENTREGUE':
                $('#cardModal').addClass('modal-success');
                break;
            default:
                $('#cardModal').addClass('modal-danger');
        }
    },

    onClickCard: function() {
        var self = this;
        $(document).on('click', '.card', function() {
            var order = self.getOrderById($(this).data('id'));
            console.log(order);

            if (order) {
                self.setCardModalOrder(order);
                $('#cardModal').modal('show');
            }
        });
    },

    onChangeLimitOrders: function() {
        var self = this;
        $('#filterOrdersLimit').change(function() {
            var limit = $(this).val();
            if (window.ordersList.length > limit) {
                window.ordersList = [];
                $('.card:not(.sample)').remove();
            }
            self.getOrders(limit);
        });
    },

    onSaveCard: function() {
        var self = this;
        $('#modalSave').click(function () {
            var id = $('#cardModal').data('id'),
                status = $('#cardModal #status').val();

            if (id && status) {
                $.ajax({
                    type: 'PATCH',
                    url: APIURL + '/orders/status',
                    data: {id: id, status: status, _method: 'PATCH'},
                    success: function(order) {
                        $('#cardModal').modal('hide');
                        self.insertOrder(order);
                        console.log('Status do Pedido ' + id + ' alterado para ' + order.status);
                    }
                });
            }
        });
    },

    onClickFilter: function() {
        $('.filters .status').click(function() {
            var status = $(this).data('status');
            if ($(this).hasClass("active")) {
                $('.card[data-status="'+status+'"]').removeClass('active');
                /*setTimeout(function() {
                    $('.card[data-status="'+status+'"]').hide();
                },300);*/
            } else {
                //$('.card[data-status="'+status+'"]').show();
                $('.card[data-status="'+status+'"]').addClass('active');
            }
            $(this).toggleClass('active');
        });
    }
};

$(document).ready(function() {
    if ($('body').hasClass('quick-order')) {
        window.quickOrder.init();
    }

    if ($('body').hasClass('orders')) {
        window.orders.init();
    }
});