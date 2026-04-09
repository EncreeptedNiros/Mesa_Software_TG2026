using MesaApi.Data;
using MesaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MesaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProdutoController : ControllerBase
    {
        private readonly ProdutoContext _context;

        public ProdutoController(ProdutoContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Produto>> Create([FromBody] Produto produto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            _context.Produtos.Add(produto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = produto.Id }, produto);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Produto>> GetById(int id)
        {
            var produto = await _context.Produtos.FirstOrDefaultAsync(item => item.Id == id);

            if (produto is null)
            {
                return NotFound(new { erro = "Produto nao encontrado." });
            }

            return Ok(produto);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Produto>>> GetAll([FromQuery] int skip = 0, [FromQuery] int take = 5)
        {
            var produtos = await _context.Produtos
                .OrderByDescending(item => item.Id)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return Ok(produtos);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Produto>> Update(int id, [FromBody] Produto produtoAtualizado)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var produto = await _context.Produtos.FirstOrDefaultAsync(item => item.Id == id);

            if (produto is null)
            {
                return NotFound(new { erro = "Produto nao encontrado." });
            }

            produto.Nome = produtoAtualizado.Nome;
            produto.Categoria = produtoAtualizado.Categoria;
            produto.Custo = produtoAtualizado.Custo;
            produto.Valor = produtoAtualizado.Valor;
            produto.Receita = produtoAtualizado.Receita;
            produto.ImagemUrl = produtoAtualizado.ImagemUrl;

            await _context.SaveChangesAsync();

            return Ok(produto);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var produto = await _context.Produtos.FirstOrDefaultAsync(item => item.Id == id);

            if (produto is null)
            {
                return NotFound(new { erro = "Produto nao encontrado." });
            }

            _context.Produtos.Remove(produto);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Produto removido com sucesso." });
        }
    }
}


