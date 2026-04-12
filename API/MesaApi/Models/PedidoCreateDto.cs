namespace MesaApi.Models
{
    public class PedidoCreateDto
    {
        public DateTime Data_da_venda { get; set; }
        public int ProdutoId { get; set; }
        public string NumeroMesa { get; set; } = string.Empty;
        public string Observacoes { get; set; } = string.Empty;
        public bool Status { get; set; }
    }
}
