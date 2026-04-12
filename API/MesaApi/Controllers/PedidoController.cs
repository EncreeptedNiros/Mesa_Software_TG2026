using MesaApi.Data;
using MesaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MesaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidoController : ControllerBase
    {
        private readonly PedidoContext _context;

        public PedidoController(PedidoContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Pedido>> Create([FromBody] PedidoCreateDto pedidoDto)
        {
            var produto = await _context.Produtos.FirstOrDefaultAsync(item => item.Id == pedidoDto.ProdutoId);

            if (produto is null)
            {
                return BadRequest(new { erro = "Produto informado para o pedido nao existe." });
            }

            var pedido = new Pedido
            {
                Data_da_venda = pedidoDto.Data_da_venda,
                Produto = produto,
                NumeroMesa = pedidoDto.NumeroMesa,
                Observacoes = pedidoDto.Observacoes,
                Status = pedidoDto.Status
            };

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = pedido.Id }, pedido);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Pedido>> GetById(int id)
        {
            var pedido = await _context.Pedidos
                .Include(item => item.Produto)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (pedido is null)
            {
                return NotFound(new { erro = "Pedido nao encontrado." });
            }

            return Ok(pedido);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetAll([FromQuery] int skip = 0, [FromQuery] int take = 5)
        {
            var pedidos = await _context.Pedidos
                .Include(item => item.Produto)
                .OrderByDescending(item => item.Id)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return Ok(pedidos);
        }

        [HttpPatch("{id:int}/status")]
        public async Task<ActionResult<Pedido>> AtualizarStatus(int id, [FromBody] PedidoStatusUpdateDto statusDto)
        {
            var pedido = await _context.Pedidos
                .Include(item => item.Produto)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (pedido is null)
            {
                return NotFound(new { erro = "Pedido nao encontrado." });
            }

            pedido.Status = statusDto.Status;
            await _context.SaveChangesAsync();

            return Ok(pedido);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Pedido>> Update(int id, [FromBody] PedidoCreateDto pedidoDto)
        {
            var pedido = await _context.Pedidos
                .Include(item => item.Produto)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (pedido is null)
            {
                return NotFound(new { erro = "Pedido nao encontrado." });
            }

            var produto = await _context.Produtos.FirstOrDefaultAsync(item => item.Id == pedidoDto.ProdutoId);

            if (produto is null)
            {
                return BadRequest(new { erro = "Produto informado para o pedido nao existe." });
            }

            pedido.Data_da_venda = pedidoDto.Data_da_venda;
            pedido.Produto = produto;
            pedido.NumeroMesa = pedidoDto.NumeroMesa;
            pedido.Observacoes = pedidoDto.Observacoes;
            pedido.Status = pedidoDto.Status;

            await _context.SaveChangesAsync();

            return Ok(pedido);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pedido = await _context.Pedidos.FirstOrDefaultAsync(item => item.Id == id);

            if (pedido is null)
            {
                return NotFound(new { erro = "Pedido nao encontrado." });
            }

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Pedido removido com sucesso." });
        }
    }
}


