using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace MesaApi.Models
{
    public class Promocao
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Descricao { get; set; } = string.Empty;

        [Range(0, 100)]
        public decimal DescontoPercentual { get; set; }

        public DateTime DataInicio { get; set; }

        public DateTime DataFim { get; set; }

        [Column("ProdutosIds")]
        public string ProdutosIdsJson { get; set; } = "[]";

        [NotMapped]
        public List<int> ProdutosIds
        {
            get
            {
                if (string.IsNullOrWhiteSpace(ProdutosIdsJson))
                {
                    return [];
                }

                try
                {
                    return JsonSerializer.Deserialize<List<int>>(ProdutosIdsJson) ?? [];
                }
                catch
                {
                    return [];
                }
            }
            set
            {
                ProdutosIdsJson = JsonSerializer.Serialize(
                    (value ?? [])
                        .Where(id => id > 0)
                        .Distinct()
                        .OrderBy(id => id)
                        .ToList()
                );
            }
        }
    }
}
