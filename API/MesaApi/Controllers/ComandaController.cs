using MesaApi.Data;
using MesaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MesaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComandaController : ControllerBase
    {
        private readonly ComandaContext _context;

        public ComandaController(ComandaContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Comanda>> Create([FromBody] Comanda comanda)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            _context.Comandas.Add(comanda);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = comanda.Id }, comanda);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Comanda>> GetById(int id)
        {
            var comanda = await _context.Comandas.FirstOrDefaultAsync(item => item.Id == id);

            if (comanda is null)
            {
                return NotFound(new { erro = "Comanda nao encontrada." });
            }

            return Ok(comanda);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comanda>>> GetAll([FromQuery] int skip = 0, [FromQuery] int take = 5)
        {
            var comandas = await _context.Comandas
                .OrderByDescending(item => item.Id)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return Ok(comandas);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Comanda>> Update(int id, [FromBody] Comanda comandaAtualizada)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var comanda = await _context.Comandas.FirstOrDefaultAsync(item => item.Id == id);

            if (comanda is null)
            {
                return NotFound(new { erro = "Comanda nao encontrada." });
            }

            comanda.Cliente = comandaAtualizada.Cliente;
            comanda.Datadeabertura = comandaAtualizada.Datadeabertura;
            comanda.Datadefechamento = comandaAtualizada.Datadefechamento;
            comanda.Status = comandaAtualizada.Status;
            comanda.Lista_ids_vendas = comandaAtualizada.Lista_ids_vendas;

            await _context.SaveChangesAsync();

            return Ok(comanda);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var comanda = await _context.Comandas.FirstOrDefaultAsync(item => item.Id == id);

            if (comanda is null)
            {
                return NotFound(new { erro = "Comanda nao encontrada." });
            }

            _context.Comandas.Remove(comanda);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Comanda removida com sucesso." });
        }
    }
}
