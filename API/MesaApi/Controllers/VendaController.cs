using MesaApi.Data;
using MesaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MesaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VendaController : ControllerBase
    {
        private readonly VendaContext _context;

        public VendaController(VendaContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Venda>> Create([FromBody] VendaCreateDto vendaDto)
        {
            if (vendaDto.produtos_ids is null || vendaDto.produtos_ids.Count == 0)
            {
                return BadRequest(new { erro = "A venda precisa ter ao menos um produto." });
            }

            var produtosIdsDistintos = vendaDto.produtos_ids
                .Distinct()
                .ToList();

            var produtos = await _context.Produtos
                .Where(item => produtosIdsDistintos.Contains(item.Id))
                .ToListAsync();

            if (produtos.Count != produtosIdsDistintos.Count)
            {
                return BadRequest(new { erro = "Um ou mais produtos informados nao existem." });
            }

            var venda = new Venda
            {
                data_da_venda = vendaDto.data_da_venda,
                Valor = vendaDto.Valor,
                Metodo_de_pagamento = vendaDto.Metodo_de_pagamento,
                Lista_de_produtos_texto = vendaDto.Lista_de_produtos_texto,
                Lista_de_produtos = produtos
            };

            _context.Vendas.Add(venda);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = venda.Id }, venda);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Venda>> GetById(int id)
        {
            var venda = await _context.Vendas
                .Include(item => item.Lista_de_produtos)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (venda is null)
            {
                return NotFound(new { erro = "Venda nao encontrada." });
            }

            return Ok(venda);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Venda>>> GetAll([FromQuery] int skip = 0, [FromQuery] int take = 5)
        {
            var vendas = await _context.Vendas
                .Include(item => item.Lista_de_produtos)
                .OrderByDescending(item => item.Id)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return Ok(vendas);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Venda>> Update(int id, [FromBody] VendaCreateDto vendaDto)
        {
            var venda = await _context.Vendas
                .Include(item => item.Lista_de_produtos)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (venda is null)
            {
                return NotFound(new { erro = "Venda nao encontrada." });
            }

            if (vendaDto.produtos_ids is null || vendaDto.produtos_ids.Count == 0)
            {
                return BadRequest(new { erro = "A venda precisa ter ao menos um produto." });
            }

            var produtosIdsDistintos = vendaDto.produtos_ids
                .Distinct()
                .ToList();

            var produtos = await _context.Produtos
                .Where(item => produtosIdsDistintos.Contains(item.Id))
                .ToListAsync();

            if (produtos.Count != produtosIdsDistintos.Count)
            {
                return BadRequest(new { erro = "Um ou mais produtos informados nao existem." });
            }

            venda.data_da_venda = vendaDto.data_da_venda;
            venda.Valor = vendaDto.Valor;
            venda.Metodo_de_pagamento = vendaDto.Metodo_de_pagamento;
            venda.Lista_de_produtos_texto = vendaDto.Lista_de_produtos_texto;
            venda.Lista_de_produtos = produtos;

            await _context.SaveChangesAsync();

            return Ok(venda);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var venda = await _context.Vendas.FirstOrDefaultAsync(item => item.Id == id);

            if (venda is null)
            {
                return NotFound(new { erro = "Venda nao encontrada." });
            }

            _context.Vendas.Remove(venda);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Venda removida com sucesso." });
        }
    }
}
