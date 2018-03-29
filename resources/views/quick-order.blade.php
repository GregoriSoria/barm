@extends('voyager::master')

<link rel="stylesheet" href="{{ asset('css/app.css') }}">

@section('page_title', 'Pedido Rápido')

@section('page_header')
    <h1 class="page-title">
        <i class="voyager-play"></i>
        Pedido Rápido
    </h1>
@stop

@section('content')
    <div class="page-content container-fluid">
        <form class="form-edit-add" role="form" action="/admin/quick-order" method="POST" enctype="multipart/form-data">
            {{ csrf_field() }}
            <div class="row">
                <div class="col-md-8">
                    <div class="panel">
                        <div class="panel-heading">
                            <h3 class="panel-title">
                                <i class="voyager-telephone"></i> Insira o telefone do cliente
                            </h3>
                        </div>
                        <div class="panel-body">
                            <input type="text" class="form-control" id="phone_primary" name="phone_primary" pattern="\d+" placeholder="Telefone">
                        </div>
                    </div>

                    <div class="panel">
                        <div class="panel-heading">
                            <h3 class="panel-title"><i class="icon wb-book"></i> Informações do Pedido</h3>
                            <div class="panel-actions">
                                <a class="panel-action voyager-angle-down" data-toggle="panel-collapse" aria-hidden="true"></a>
                            </div>
                        </div>

                        <div class="panel-body">
                            <div><label for="name">Produtos</label></div>
                            <div class="products-list list-group col-md-5">
                                <!--<a href="#" class="list-group-item list-group-item-action"><span> sample </span> <i class="voyager-plus"></i></a>-->
                            </div>
                        </div>
                    </div><!-- .panel -->

                    <div class="panel">
                        <div class="panel-heading">
                            <h3 class="panel-title"><i class="icon wb-book"></i> Informações do Cliente</h3>
                            <div class="panel-actions">
                                <a class="panel-action voyager-angle-down" data-toggle="panel-collapse" aria-hidden="true"></a>
                            </div>
                        </div>
                        <div class="panel-body">
                            <div class="form-group">
                                <input type="text" class="form-control" id="adress" name="adress" placeholder="Endereço">
                            </div>

                            <div class="form-group">
                                <input type="text" class="form-control" id="name" name="name" placeholder="Nome">
                            </div>

                            <div class="form-group">
                                <input type="text" class="form-control" id="phone_secondary" name="phone_secondary" placeholder="Telefone secundário">
                            </div>

                            <div class="form-group">
                                <input type="email" class="form-control" id="email" name="email" placeholder="Email">
                            </div>
                        </div>
                    </div><!-- .panel -->
                </div>
                <div class="col-md-4">
                    <!-- ### DETAILS ### -->
                    <div class="panel panel panel-bordered panel-warning">
                        <div class="panel-heading">
                            <h3 class="panel-title"><i class="icon wb-clipboard"></i> Pedido</h3>
                            <div class="panel-actions">
                                <a class="panel-action voyager-angle-down" data-toggle="panel-collapse" aria-hidden="true"></a>
                            </div>
                        </div>
                        <div class="panel-body">
                            <div class="panel-body">
                                <label for="name">Produtos</label>
                                <div class="order-products-list list-group">
                                    <!--<a href="#" class="list-group-item list-group-item-action"><span>Cras justo odio</span> <i class="voyager-x"></i></a> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button type="submit" class="btn btn-primary pull-right">Confirmar pedido</button>
        </form>
    </div>
@endsection

<script type="text/javascript" src="{{ asset('js/app.js') }}"></script>
