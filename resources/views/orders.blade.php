<?php $dataType = new stdClass(); $dataType->slug = 'orders'; ?>

@extends('voyager::master')

<link rel="stylesheet" href="{{ asset(env('APP_URL', '') . '/css/app.css') }}">

@section('page_title', 'Pedidos')

@section('page_header')
    <h1 class="page-title">
        <i class="voyager-window-list"></i>
        Pedidos
    </h1>
@stop

@section('content')
    <div id="orders" class="page-content container-fluid">
        <div class="card sample" data-status="" data-id="" style="display: none;">
            <div class="card-header"><div class="card-title"></div></div>
            <div class="card-body">
                <h5 class="card-title">Items</h5>
                <ul class="items"></ul>
                <h5 class="total"></h5>
            </div>
        </div>
    </div>

    <div class="modal fade modal-danger modal-relationships" id="cardModal">
        <div class="modal-dialog relationship-panel">
            <div class="model-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                    <h4 class="modal-title"><i class="voyager-window-list"></i><span class="order">Pedido N º </span></h4>
                </div>

                <div class="modal-body" data-id="">
                    <div class="row">
                        <div class="col-md-12 relationship_details_more">
                            <div class="well">
                                <label>Endereço</label>
                                <div class="relationship_details">
                                    <p class="relationship_table_select">Cidade</p>
                                    <input type="text" class="form-control" readonly required id="city" name=city" maxlength="80">
                                </div>

                                <div class="relationship_details">
                                    <p class="relationship_table_select">Bairro</p>
                                    <input type="text" class="form-control" readonly required id="neighborhood" name="neighborhood" maxlength="80">
                                </div>

                                <div class="relationship_details">
                                    <p class="relationship_table_select">Rua</p>
                                    <input type="text" class="form-control" readonly required id="street" name="street" maxlength="80">
                                </div>

                                <div class="relationship_details">
                                    <p class="relationship_table_select">Número</p>
                                    <input type="text" class="form-control" readonly required id="number" name="number" maxlength="80">
                                </div>

                                <div class="relationship_details">
                                    <p class="relationship_table_select">Complemento</p>
                                    <input type="text" class="form-control" readonly required id="complement" name="complement" maxlength="80">
                                </div>
                            </div>
                        </div>

                        <div class="col-md-12 relationship_details_more">
                            <div class="well">
                                <label>Items</label>
                                <div id="items"></div>
                            </div>
                        </div>

                        <div class="col-md-12 relationship_details">
                            <p class="relationship_table_select">Total</p>
                            <input type="text" class="form-control" readonly required id="total" name="total" value="R$ 0,00" maxlength="80">
                        </div>

                        <div class="col-md-12 relationship_details_more">
                            <div class="well">
                                <label>Cliente</label>

                                <div class="relationship_details">
                                    <p class="relationship_table_select">Nome</p>
                                    <input type="text" class="form-control" readonly required id="name" name="name" maxlength="80">
                                </div>

                                <div class="relationship_details">
                                    <p class="relationship_table_select">Telefone Primário</p>
                                    <input type="text" class="form-control" readonly required id="phone_primary" name="phone_primary" maxlength="80">
                                </div>

                                <div class="relationship_details">
                                    <p class="relationship_table_select">Telefone Secundário</p>
                                    <input type="text" class="form-control" readonly required id="phone_secondary" name="phone_secondary" maxlength="80">
                                </div>

                                <div class="relationship_details">
                                    <p class="relationship_table_select">Email</p>
                                    <input type="text" class="form-control" readonly required id="email" name="email" maxlength="80">
                                </div>
                            </div>
                        </div>

                        <div class="col-md-12 relationship_details">
                            <p class="relationship_table_select">Status</p>
                            <select class="relationship_type select2 select2-hidden-accessible" id="status" name="status" tabindex="-1" aria-hidden="true">
                                <option value="APROVADO">PEDIDO APROVADO</option>
                                <option value="PRODUCAO">PEDIDO EM PRODUÇÃO</option>
                                <option value="EXPEDIDO">PEDIDO EXPEDIDO</option>
                                <option value="ENTREGUE">PEDIDO ENTREGUE</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="relationship-btn-container">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
                        <button id="modalSave" class="btn btn-danger btn-relationship"><span>Salvar</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

<script type="text/javascript" src="{{ asset(env('APP_URL', '') . '/js/app.js') }}"></script>
<script src="https://maps.googleapis.com/maps/api/js?key={{setting('site.googlemapskey')}}&libraries=places" defer></script>

