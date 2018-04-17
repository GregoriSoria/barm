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

	Pastel & Beer<br>
	{{date("d/m/Y – H:i:s")}}<br>
	Nome cliente: {{$order->customer->name}} <br><br>

	Telefone cliente: {{$order->customer->phone_primary}} <br><br>

	Endereço: {{$order->adress->adress}} {{$order->adress->number}}, {{$order->adress->neighborhood->name}}, {{$order->adress->city->name}} <br><br>

	Cupom não fiscal<br>
	@foreach ($order->order_products as $oProduct)
		{{$oProduct->product->name}}<br>
		@if ($oProduct->observation)
			Observação : {{$oProduct->observation}}<br>
		@endif
		R$ {{str_replace('.', ',', number_format((float)$oProduct->product->value, 2, '.', ''))}}<br>
		{{$oProduct->quantity}}.0<br>
		R$ {{str_replace('.', ',', number_format((float)$oProduct->total, 2, '.', ''))}}<br><br>
	@endforeach
	Totais<br><br>
	Valor do pedido:<br>
	R$ {{str_replace('.', ',', number_format((float)$order->total, 2, '.', ''))}}<br><br>
	Forma de pagamento:<br>
	{{$order->payment_method->name}}<br><br>
	Troco:<br>
	(R${{str_replace('.', ',', number_format((float)$order->change, 2, '.', ''))}})-R${{str_replace('.', ',', number_format((float)$order->total, 2, '.', ''))}}<br><br>
	Taxa de serviço:<br>
	- <br><br>
	Desconto:<br>
	- <br><br>
	Total:<br>
	R$ {{str_replace('.', ',', number_format((float)$order->total, 2, '.', ''))}}<br><br>
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
	Pedido:<br>
	www.pastelebeer.com.br

	<script>
        window.print();
	</script>
    </body>
</html>
