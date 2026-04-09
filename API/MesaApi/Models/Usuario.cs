using System.ComponentModel.DataAnnotations;

namespace MesaApi.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(80)]
        public string Login { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Senha { get; set; } = string.Empty;

        [MaxLength(60)]
        public string Perfil { get; set; } = "Operador";

        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    }
}
