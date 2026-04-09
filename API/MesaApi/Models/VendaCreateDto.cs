namespace MesaApi.Models
{
    public class VendaCreateDto
    {
        public DateTime data_da_venda { get; set; }
        public float Valor { get; set; }
        public string Metodo_de_pagamento { get; set; } = string.Empty;
        public string Lista_de_produtos_texto { get; set; } = string.Empty;
        public List<int> produtos_ids { get; set; } = new();
    }
}
