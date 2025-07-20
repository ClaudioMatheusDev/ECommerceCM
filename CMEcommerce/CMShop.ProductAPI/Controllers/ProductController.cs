using CMShop.ProductAPI.Data.ValueObjects;
using CMShop.ProductAPI.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMShop.ProductAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private IProductRepository _repository;
        public ProductController(IProductRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductVO>>> FindAll()
        {
            var products = await _repository.FindAll();
            return Ok(products);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductVO>> FindById(long id)
        {
            var product = await _repository.FindById(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<ActionResult<ProductVO>> Create(ProductVO vo)
        {
            if (vo == null) return BadRequest();
            var product = await _repository.Create(vo);
            return Ok(product);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProductVO>> Update(long id, [FromBody] ProductVO vo)
        {
            try
            {
                Console.WriteLine($"PUT Request received - ID: {id}, Product: {vo?.Name}");
                
                if (vo == null) 
                {
                    Console.WriteLine("Product data is null");
                    return BadRequest("Dados do produto são obrigatórios");
                }
                
                if (id != vo.Id) 
                {
                    Console.WriteLine($"ID mismatch - URL: {id}, Body: {vo.Id}");
                    return BadRequest("ID do produto não confere");
                }
                
                var product = await _repository.Update(vo);
                Console.WriteLine($"Product updated successfully: {product.Name}");
                return Ok(product);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating product: {ex.Message}");
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(long id)
        {
            var status = await _repository.Delete(id);
            if (!status) return BadRequest();
            return Ok(status);
        }
    }
}
