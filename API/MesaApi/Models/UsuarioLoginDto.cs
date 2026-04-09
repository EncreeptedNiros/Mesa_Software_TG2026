using System.ComponentModel.DataAnnotations;

namespace MesaApi.Models
{
    public class UsuarioLoginDto
    {
        [Required]
        [MaxLength(80)]
        public string Login { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Senha { get; set; } = string.Empty;
    }
}
