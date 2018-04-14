<!DOCTYPE html>
<html>

    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>CUPOM FISCAL BARM</title>
        <meta name="description" content="Cupom fiscal">
		<link rel="shortcut icon" href="{{ voyager_asset('images/logo-icon.png') }}" type="image/x-icon">
        <style>

            @color-gray: #BCBCBC;
            .text {
                &-center { text-align: center; }
            }
            .ttu { text-transform: uppercase; }

            .printer-ticket {
                display: table !important;
                width: 100%;
                max-width: 400px;
                font-weight: light;
                line-height: 1.3em;
                @printer-padding-base: 10px;
                &, & * {
                    font-family: Tahoma, Geneva, sans-serif;
                    font-size: 10px;
                }

                th:nth-child(2),
                td:nth-child(2) {
                width: 50px;
                }

                th:nth-child(3) ,
                td:nth-child(3) {
                width: 90px; text-align: right;
                }

                th {
                    font-weight: inherit;
                    padding: @printer-padding-base 0;
                    text-align: center;
                    border-bottom: 1px dashed @color-gray;
                }
                tbody {
                    tr:last-child td { padding-bottom: @printer-padding-base; }
                }
                tfoot {
                    .sup td {
                        padding: @printer-padding-base 0;
                        border-top: 1px dashed @color-gray;
                    }
                    .sup.p--0 td { padding-bottom: 0; }
                }

                .title { font-size: 1.5em; padding: @printer-padding-base*1.5 0; }
                .top {
                    td { padding-top: @printer-padding-base; }
                }
                .last td { padding-bottom: @printer-padding-base; }
            }

        </style>
    </head>
    <body>


      <table class="printer-ticket">
 	<thead>
		<tr>
			<th class="title" colspan="3">Pastel & Beer</th>
		</tr>
		<tr>
			<th colspan="3">{{date("d/m/Y – H:i:s")}}</th>
		</tr>
		<tr>
			<th colspan="3">
    			{{$order->customer->name}} <br />
				{{$order->customer->phone_primary}} <br>
				{{$order->adress->adress}} {{$order->adress->number}}, {{$order->adress->neighborhood->name}}, {{$order->adress->city->name}}
			</th>
		</tr>
		<tr>
			<th class="ttu" colspan="3">
				<b>Cupom não fiscal</b>
			</th>
		</tr>
	</thead>
	@foreach ($order->order_products as $oProduct)
		<tbody>
			<tr class="top">
				<td colspan="3">{{$oProduct->product->name}}</td>
			</tr>
			@if ($oProduct->observation)
				<tr>
					<td colspan="3">Observação : {{$oProduct->observation}}</td>
				</tr>
			@endif
			<tr>
				<td>R$ {{str_replace('.', ',', number_format((float)$oProduct->product->value, 2, '.', ''))}}</td>
				<td>{{$oProduct->quantity}}.0</td>
				<td>R$ {{str_replace('.', ',', number_format((float)$oProduct->total, 2, '.', ''))}}</td>
		</tbody>
	@endforeach
	<tfoot>
		<tr class="sup ttu p--0">
			<td colspan="3">
				<b>Totais</b>
			</td>
		</tr>
		<tr class="ttu">
			<td colspan="2">Valor do pedido</td>
			<td align="right">R$ {{str_replace('.', ',', number_format((float)$order->total, 2, '.', ''))}}</td>
		</tr>
		<tr class="ttu">
			<td colspan="2">Forma de pagamento</td>
			<td align="right">{{$order->payment_method->name}}</td>
		</tr>
		<!--<tr class="ttu">
			<td colspan="2">Troco</td>
			<td align="right">(R$50,00)-R$15,50</td>
		</tr>-->
		<tr class="ttu">
			<td colspan="2">Taxa de serviço</td>
			<td align="right">-</td>
		</tr>
		<tr class="ttu">
			<td colspan="2">Desconto</td>
			<td align="right">-</td>
		</tr>
		<tr class="ttu">
			<td colspan="2">Total</td>
			<td align="right">R$ {{str_replace('.', ',', number_format((float)$order->total, 2, '.', ''))}}</td>
		</tr>
		<!--
		<tr class="sup ttu p--0">
			<td colspan="3">
				<b>Pagamentos</b>
			</td>
		</tr>
		<tr class="ttu">
			<td colspan="2">Voucher</td>
			<td align="right">R$10,00</td>
		</tr>
		<tr class="ttu">
			<td colspan="2">Dinheiro</td>
			<td align="right">R$10,00</td>
		</tr>
		<tr class="ttu">
			<td colspan="2">Total pago</td>
			<td align="right">R$10,00</td>
		</tr>
		<tr class="ttu">
			<td colspan="2">Troco</td>
			<td align="right">R$0,44</td>
		</tr>
		-->
		<tr class="sup">
			<td colspan="3" align="center">
				<b>Pedido:</b>
			</td>
		</tr>
		<tr class="sup">
			<td colspan="3" align="center">
    www.pastelebeer.com.br

			</td>
		</tr>
	</tfoot>
</table>

	<script>
        window.print();
	</script>
    </body>
</html>
