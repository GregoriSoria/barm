window.$ = window.jQuery = require('jquery');
var Inputmask = require('inputmask');

var APIURL = '/admin/api';

var quickOrder = {
    init: function() {
        console.log('QuickOrder!');
        this.setMasks();
        this.declarations();
        this.listProducts();
    },

    productsList: '.products-list',
    productsListItem: '.products-list .list-group-item',
    orderProductsList: '.order-products-list',
    orderProductsListItem: '.order-products-list .list-group-item',

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
        this.onAddProduct();
        this.onRemoveProduct();
        this.onSubmit();
        this.onBtnClear();
    },

    listProducts: function () {
        var self = this;
        $.ajax({
            url: APIURL + '/products',
            success: function(products) {
                products.forEach(function(product) {
                    $(self.productsList).append(self.setProductListItem(product.quantity, product.id, product.name, product.value));
                });
            }
        })
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
        var adress = document.querySelector("[name='adress']");
        var products = this.getOrderProducts();
        var valid = true;

        if (!Inputmask.isValid(phone_primary.value, { mask: "(99) 9 9999-999[9]"})) {
            console.log('Telefone primário inválido');
            phone_primary.classList.add('invalid');
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
        document.querySelector("[name='adress']").value = '';
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
                        document.querySelector("[name='adress']").value = customer.adress;
                        document.querySelector("[name='name']").value = customer.name;
                        document.querySelector("[name='phone_secondary']").value = customer.phone_secondary;
                        document.querySelector("[name='email']").value = customer.email;
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            } else {
                console.log('ué');
            }
        });
    },

    onSubmit: function() {
        var self = this;
        $("button[type=submit]").click(function (e) {
            e.preventDefault();

            var order = self.getFormValues();

            if (self.formValidate()) {
                console.log(order);
                self.clearForm();

                $.ajax({
                    type: 'POST',
                    data: order,
                    url: APIURL + '/orders/quick',
                    success: function (response) {
                        console.log(response);
                        toastr.success('Pedido adicionado com sucesso!');
                    },
                    error: function (err) {
                        console.log(err);
                        toastr.error('Ocorrreu algum problema no envio do pedido. Informe ao desenvolvedor do site');
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
            adress: document.querySelector("[name='adress']").value,
            name: document.querySelector("[name='name']").value,
            phone_secondary: document.querySelector("[name='phone_secondary']").inputmask.unmaskedvalue(),
            email: document.querySelector("[name='email']").value
        };
        return form;
    }
};

$(document).ready(function() {
    quickOrder.init();
});