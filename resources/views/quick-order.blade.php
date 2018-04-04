@extends('voyager::master')

<link rel="stylesheet" href="{{ asset(env('APP_URL', '') . '/css/app.css') }}">

@section('page_title', 'Pedido Rápido')

@section('page_header')
    <h1 class="page-title">
        <i class="voyager-play"></i>
        Pedido Rápido
    </h1>
@stop

@section('content')
    <div class="page-content container-fluid">
        <form id="orderForm" class="form-edit-add" role="form" action="/admin/quick-order" method="POST" enctype="multipart/form-data">

            <div class="row">
                <div class="col-md-8">
                    <div class="panel">
                        <div class="panel-heading">
                            <h3 class="panel-title">
                                <i class="voyager-telephone"></i> Insira o telefone do cliente
                            </h3>
                        </div>
                        <div class="panel-body">
                            <div class="form-group icon-voyager-search">
                                <label for="phone_primary">Telefone</label>
                                <input type="tel" class="form-control phone" required min="15" max="16" id="phone_primary" name="phone_primary" placeholder="Telefone">
                            </div>
                        </div>
                    </div>

                    <div class="panel">
                        <div class="panel-heading">
                            <h3 class="panel-title"><i class="icon wb-book"></i> Informações do Cliente</h3>
                            <div class="panel-actions">
                                <a class="panel-action voyager-angle-down" data-toggle="panel-collapse" aria-hidden="true"></a>
                            </div>
                        </div>
                        <div class="panel-body">
                            <div class="form-group icon-voyager-search">
                                <label for="search">Procurar endereço</label>
                                <input type="text" class="form-control" required id="search" name="search" placeholder="Procurar endereço" maxlength="80">
                            </div>

                            <div class="form-group">
                                <label for="state">Estado</label>
                                <select class="form-control select2" required name="state" id="state">
                                    <option value="">Selecione um Estado</option>
                                    <option value="1">Rio Grande do Sul</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="city">Cidade</label>
                                <select class="form-control select2" required name="city" id="city">
                                    <option value="">Selecione uma Cidade</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="neighborhood">Bairro</label>
                                <select class="form-control select2" required name="neighborhood" id="neighborhood">
                                    <option value="">Selecione um Bairro</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="adress">Endereço</label>
                                <input type="text" class="form-control" required id="adress" name="adress" placeholder="Endereço" maxlength="80">
                            </div>

                            <div class="form-group">
                                <label for="number">Número</label>
                                <input type="text" class="form-control" required id="number" name="number" placeholder="Número" maxlength="30">
                            </div>

                            <div id="map"></div>

                            <div class="form-group">
                                <label for="name">Nome</label>
                                <input type="text" class="form-control" id="name" name="name" placeholder="Nome" maxlength="60">
                            </div>

                            <div class="form-group">
                                <label for="phone_secondary">Telefon secundário</label>
                                <input type="tel" class="form-control phone" id="phone_secondary" name="phone_secondary" placeholder="Telefone secundário">
                            </div>

                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" class="form-control email" id="email" name="email" placeholder="Email">
                            </div>

                            <div class="form-group">
                                <label for="birth">Data de nascimento</label>
                                <input type="tel" class="form-control birth" id="birth" name="birth" placeholder="Data de nascimento">
                            </div>

                            <div class="form-group">
                                <label for="cpf">CPF</label>
                                <input type="tel" class="form-control cpf" id="cpf" name="cpf" placeholder="CPF">
                            </div>
                        </div>
                    </div><!-- .panel -->

                    <div class="panel">
                        <div class="panel-heading">
                            <h3 class="panel-title"><i class="icon wb-book"></i> Informações do Pedido</h3>
                            <div class="panel-actions">
                                <a class="panel-action voyager-angle-down" data-toggle="panel-collapse" aria-hidden="true"></a>
                            </div>
                        </div>

                        <div class="panel-body">
                            <div><label for="name">Produtos</label></div>
                            <div class="products-list list-group col-md-6">

                            </div>
                        </div>
                    </div><!-- .panel -->
                </div>
                <div class="col-md-4 col-pedido">
                    <!-- ### DETAILS ### -->
                    <div class="panel pedido panel-bordered panel-warning">
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

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Confirmar pedido</button>
            <button id="btnClear" class="btn btn-warning">Limpar</button>
        </form>
    </div>
@endsection

<script type="text/javascript" src="{{ asset(env('APP_URL', '') . '/js/app.js') }}"></script>
<script src="https://maps.googleapis.com/maps/api/js?key={{setting('site.googlemapskey')}}&libraries=places" defer></script>

