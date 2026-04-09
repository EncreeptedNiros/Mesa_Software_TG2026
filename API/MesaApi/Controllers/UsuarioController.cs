using MesaApi.Data;
using MesaApi.Models;
using MesaApi.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MesaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly UsuarioContext _context;

        public UsuarioController(UsuarioContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Usuario>> Create([FromBody] Usuario usuario)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            usuario.Nome = usuario.Nome.Trim();
            usuario.Login = usuario.Login.Trim();
            usuario.Perfil = string.IsNullOrWhiteSpace(usuario.Perfil) ? "Operador" : usuario.Perfil.Trim();
            usuario.Senha = PasswordHasher.HashPassword(usuario.Senha.Trim());

            var loginJaExiste = await _context.Usuarios
                .AnyAsync(item => item.Login == usuario.Login);

            if (loginJaExiste)
            {
                return BadRequest(new { erro = "Ja existe um usuario cadastrado com este login." });
            }

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = usuario.Id }, ToSafeResponse(usuario));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Usuario>> GetById(int id)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(item => item.Id == id);

            if (usuario is null)
            {
                return NotFound(new { erro = "Usuario nao encontrado." });
            }

            return Ok(ToSafeResponse(usuario));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetAll([FromQuery] int skip = 0, [FromQuery] int take = 5)
        {
            var usuarios = await _context.Usuarios
                .OrderByDescending(item => item.Id)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return Ok(usuarios.Select(ToSafeResponse));
        }

        [HttpPost("login")]
        public async Task<ActionResult<Usuario>> Login([FromBody] UsuarioLoginDto usuarioLogin)
        {
            if (string.IsNullOrWhiteSpace(usuarioLogin.Login) || string.IsNullOrWhiteSpace(usuarioLogin.Senha))
            {
                return BadRequest(new { erro = "Login e senha sao obrigatorios." });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(item => item.Login == usuarioLogin.Login.Trim());

            if (usuario is null || !usuario.Ativo)
            {
                return Unauthorized(new { erro = "Credenciais invalidas." });
            }

            var senhaInformada = usuarioLogin.Senha.Trim();
            var senhaValida = PasswordHasher.VerifyPassword(usuario.Senha, senhaInformada);

            if (!senhaValida)
            {
                return Unauthorized(new { erro = "Credenciais invalidas." });
            }

            if (!PasswordHasher.IsHashedPassword(usuario.Senha))
            {
                usuario.Senha = PasswordHasher.HashPassword(senhaInformada);
                await _context.SaveChangesAsync();
            }

            return Ok(ToSafeResponse(usuario));
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Usuario>> Update(int id, [FromBody] Usuario usuarioAtualizado)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var usuario = await _context.Usuarios.FirstOrDefaultAsync(item => item.Id == id);

            if (usuario is null)
            {
                return NotFound(new { erro = "Usuario nao encontrado." });
            }

            var loginJaExiste = await _context.Usuarios
                .AnyAsync(item => item.Id != id && item.Login == usuarioAtualizado.Login);

            if (loginJaExiste)
            {
                return BadRequest(new { erro = "Ja existe um usuario cadastrado com este login." });
            }

            usuario.Nome = usuarioAtualizado.Nome.Trim();
            usuario.Login = usuarioAtualizado.Login.Trim();
            usuario.Senha = PasswordHasher.HashPassword(usuarioAtualizado.Senha.Trim());
            usuario.Perfil = string.IsNullOrWhiteSpace(usuarioAtualizado.Perfil) ? "Operador" : usuarioAtualizado.Perfil.Trim();
            usuario.Ativo = usuarioAtualizado.Ativo;

            await _context.SaveChangesAsync();

            return Ok(ToSafeResponse(usuario));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(item => item.Id == id);

            if (usuario is null)
            {
                return NotFound(new { erro = "Usuario nao encontrado." });
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Usuario removido com sucesso." });
        }

        private static object ToSafeResponse(Usuario usuario)
        {
            return new
            {
                usuario.Id,
                usuario.Nome,
                usuario.Login,
                usuario.Perfil,
                usuario.Ativo,
                usuario.DataCriacao
            };
        }
    }
}
