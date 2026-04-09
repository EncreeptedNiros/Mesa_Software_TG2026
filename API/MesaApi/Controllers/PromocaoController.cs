using MesaApi.Data;
using MesaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MesaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromocaoController : ControllerBase
    {
        private readonly PromocaoContext _context;

        public PromocaoController(PromocaoContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Promocao>> Create([FromBody] Promocao promocao)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var validacao = NormalizarPromocao(promocao);
            if (validacao is not null)
            {
                return validacao;
            }

            _context.Promocaos.Add(promocao);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = promocao.Id }, promocao);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Promocao>> GetById(int id)
        {
            var promocao = await _context.Promocaos.FirstOrDefaultAsync(item => item.Id == id);

            if (promocao is null)
            {
                return NotFound(new { erro = "Promocao nao encontrada." });
            }

            return Ok(promocao);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Promocao>>> GetAll([FromQuery] int skip = 0, [FromQuery] int take = 5)
        {
            var promocoes = await _context.Promocaos
                .OrderByDescending(item => item.Id)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return Ok(promocoes);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Promocao>> Update(int id, [FromBody] Promocao promocaoAtualizada)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var promocao = await _context.Promocaos.FirstOrDefaultAsync(item => item.Id == id);

            if (promocao is null)
            {
                return NotFound(new { erro = "Promocao nao encontrada." });
            }

            var validacao = NormalizarPromocao(promocaoAtualizada);
            if (validacao is not null)
            {
                return validacao;
            }

            promocao.Nome = promocaoAtualizada.Nome;
            promocao.Descricao = promocaoAtualizada.Descricao;
            promocao.DescontoPercentual = promocaoAtualizada.DescontoPercentual;
            promocao.DataInicio = promocaoAtualizada.DataInicio;
            promocao.DataFim = promocaoAtualizada.DataFim;
            promocao.ProdutosIds = promocaoAtualizada.ProdutosIds;

            await _context.SaveChangesAsync();

            return Ok(promocao);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var promocao = await _context.Promocaos.FirstOrDefaultAsync(item => item.Id == id);

            if (promocao is null)
            {
                return NotFound(new { erro = "Promocao nao encontrada." });
            }

            _context.Promocaos.Remove(promocao);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Promocao removida com sucesso." });
        }

        private ActionResult? NormalizarPromocao(Promocao promocao)
        {
            promocao.Nome = promocao.Nome.Trim();
            promocao.Descricao = (promocao.Descricao ?? string.Empty).Trim();
            promocao.ProdutosIds = promocao.ProdutosIds;

            if (string.IsNullOrWhiteSpace(promocao.Nome))
            {
                return BadRequest(new { erro = "Nome da promocao e obrigatorio." });
            }

            if (promocao.DataFim < promocao.DataInicio)
            {
                return BadRequest(new { erro = "A data fim deve ser maior ou igual a data inicio." });
            }

            if (promocao.ProdutosIds.Count == 0)
            {
                return BadRequest(new { erro = "Informe pelo menos um produto para a promocao." });
            }

            return null;
        }
    }
}
