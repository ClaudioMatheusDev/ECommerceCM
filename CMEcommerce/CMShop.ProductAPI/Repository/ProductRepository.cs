using AutoMapper;
using CMShop.ProductAPI.Data.ValueObjects;
using CMShop.ProductAPI.Model;
using CMShop.ProductAPI.Model.Context;
using Microsoft.EntityFrameworkCore;

namespace CMShop.ProductAPI.Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly SqlContext _context;
        private IMapper _mapper;

        public ProductRepository(SqlContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<IEnumerable<ProductVO>> FindAll()
        {
            List<Product> products = await _context.Products.ToListAsync();
            return _mapper.Map<List<ProductVO>>(products);
        }

        public async Task<ProductVO> FindById(long id)
        {
            Product product = await _context.Products.Where(p => p.Id == id).FirstOrDefaultAsync() ?? new Product();
            return _mapper.Map<ProductVO>(product);
        }

        public async Task<ProductVO> Create(ProductVO vo)
        {
            Product product = _mapper.Map<Product>(vo);
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return _mapper.Map<ProductVO>(product);
        }
        public async Task<ProductVO> Update(ProductVO vo)
        {
            // Verificar se o produto existe
            var existingProduct = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == vo.Id);
            
            if (existingProduct == null)
            {
                throw new Exception($"Produto com ID {vo.Id} não encontrado");
            }
            
            // Atualizar apenas as propriedades necessárias
            existingProduct.Name = vo.Name;
            existingProduct.CategoryName = vo.CategoryName;
            existingProduct.Description = vo.Description;
            existingProduct.ImageURL = vo.ImageURL;
            existingProduct.Price = vo.Price;
            
            _context.Products.Update(existingProduct);
            await _context.SaveChangesAsync();
            
            return _mapper.Map<ProductVO>(existingProduct);
        }
        public async Task<bool> Delete(long id)
        {
            try
            {
                Product product = await _context.Products
                    .Where(p => p.Id == id)
                    .FirstOrDefaultAsync() ?? new Product();

                if (product.Id <= 0)
                    return false; 

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                return true; 
            }
            catch (Exception)
            {
                return false;
            }
        }

    }
}
