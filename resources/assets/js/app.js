require('./bootstrap');
require('jquery');

var quickOrder = {
    init: function() {
        console.log('QuickOrder!');
        this.declarations();
        this.listProducts();
    },

    productsList: '.products-list',
    productsListItem: '.products-list .list-group-item',
    orderProductsList: '.order-products-list',
    orderProductsListItem: '.order-products-list .list-group-item',

    setProductListItem: function(quantity, id, name, value) {
      return '<a href="#" ondragstart="return false;" class="list-group-item list-group-item-action" data-id="'+id+'" data-quantity="'+quantity+'" data-value="'+value+'"><span>'+name+'</span><i class="voyager-plus"></i></a>';
    },

    setOrderProductListItem: function(quantity, id, name, value) {
        return '<a href="#" ondragstart="return false;" class="list-group-item list-group-item-action" data-id="'+id+'" data-quantity="'+quantity+'" data-value="'+value+'"><span>'+name+'</span><i class="voyager-x"></i></a>';
    },

    declarations: function() {
        this.onAddProduct();
        this.onRemoveProduct();
    },

    listProducts: function () {
        var self = this;
        $.ajax({
            url: '/api/products',
            success: function(products) {
                products.forEach(function(product) {
                    console.log(product);
                    $(self.productsList).append(self.setProductListItem(product.quantity, product.id, product.name, product.value));
                });
            }
        })
    },

    onAddProduct: function() {
        var self = this;
        $(document).on('click', self.productsListItem, function(e) {
            e.preventDefault();

            console.log($(this).data('quantity'));

            var id = $(this).data('id'),
                name = $(this).find('span').html(),
                value = $(this).data('value');

            var quantity = document.querySelector('a[data-id="'+id+'"]').getAttribute('data-quantity')-1;
            document.querySelector('a[data-id="'+id+'"]').setAttribute('data-quantity', quantity);

            if (quantity <= 0) {
                $(this).attr('disabled', 'disabled');
            }

            $(self.orderProductsList).append(self.setOrderProductListItem(quantity, id, name, value));
        });
    },

    onRemoveProduct: function() {
        var self = this;
        $(document).on('click', self.orderProductsListItem, function(e) {
            e.preventDefault();

            console.log($(this).data('quantity'));

            var id = $(this).data('id'),
                name = $(this).find('span').html(),
                value = $(this).data('value');

            var product = document.querySelector(self.productsListItem+'[data-id="'+id+'"]');

            var quantity = parseInt(product.getAttribute('data-quantity'))+1;
            product.setAttribute('data-quantity', quantity);

            if (quantity <= 0) {
                product.setAttribute('disabled', 'disabled');
            } else {
                product.setAttribute('disabled', 'false');
            }

            $(this).remove();
        });
    }
};

$(document).ready(function() {
    quickOrder.init();
});