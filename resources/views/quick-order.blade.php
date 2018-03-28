@extends('voyager::master')

@section('css')
    <meta name="csrf-token" content="{{ csrf_token() }}">
@stop

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
                    <!-- ### TITLE ### -->
                    <div class="panel">
                        @if (count($errors) > 0)
                            <div class="alert alert-danger">
                                <ul>
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <div class="panel-heading">
                            <h3 class="panel-title">
                                <i class="voyager-telephone"></i> Insira o telefone do cliente
                            </h3>
                        </div>
                        <div class="panel-body">
                            <input type="text" class="form-control" id="phone" name="phone" placeholder="Telefone">
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
                            <input type="text" class="form-control" id="products" name="products" placeholder="Produtos">
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
                            <input type="text" class="form-control" id="products" name="products" placeholder="Produtos">
                        </div>
                        <div class="panel-body">
                            <input type="text" class="form-control" id="adress" name="adress" placeholder="Endereço">
                        </div>
                    </div><!-- .panel -->
                </div>
            </div>

            <button type="submit" class="btn btn-primary pull-right">
                <i class="icon voyager-play"></i> Confirmar pedido
            </button>
        </form>
    </div>
@endsection
