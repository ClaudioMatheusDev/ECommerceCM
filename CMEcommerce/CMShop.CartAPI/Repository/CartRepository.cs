using AutoMapper;
using CMShop.CartAPI.Data.ValueObjects;
using CMShop.CartAPI.Model;
using CMShop.CartAPI.Model.Context;
using Microsoft.EntityFrameworkCore;

namespace CMShop.CartAPI.Repository
{
    public class CartRepository : ICartRepository
    {
        private readonly SqlContext _context;
        private IMapper _mapper;

        public CartRepository(SqlContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<bool> ApplyCoupon(string userId, string couponCode)
        {
            var cartHeader = await _context.CartHeaders
                .FirstOrDefaultAsync(c => c.UserId == userId);
            
            if (cartHeader != null)
            {
                cartHeader.CouponCode = couponCode;
                _context.CartHeaders.Update(cartHeader);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> ClearCart(string userId)
        {
            var cartHeader = await _context.CartHeaders
                        .FirstOrDefaultAsync(c => c.UserId == userId);
            if (cartHeader != null)
            {
                _context.CartDetails.RemoveRange(
                    _context.CartDetails.Where(c => c.CartHeaderId == cartHeader.Id)
                    );
                _context.CartHeaders.Remove(cartHeader);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<CartVO?> FindCartByUserID(string userId)
        {
            try
            {
                var cartHeader = await _context.CartHeaders
                    .FirstOrDefaultAsync(c => c.UserId == userId);
                
                if (cartHeader == null)
                {
                    return null;
                }

                var cartDetails = await _context.CartDetails
                    .Where(c => c.CartHeaderId == cartHeader.Id)
                    .Include(c => c.Product)
                    .ToListAsync();

                var cart = new Cart
                {
                    CartHeader = cartHeader,
                    CartDetails = cartDetails
                };

                return _mapper.Map<CartVO>(cart);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao buscar carrinho para usuário {userId}: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<CartVO>> FindAllCarts()
        {
            var cartHeaders = await _context.CartHeaders.ToListAsync();
            var carts = new List<Cart>();

            foreach (var header in cartHeaders)
            {
                var cart = new Cart
                {
                    CartHeader = header,
                    CartDetails = await _context.CartDetails
                        .Where(c => c.CartHeaderId == header.Id)
                        .Include(c => c.Product)
                        .ToListAsync()
                };
                carts.Add(cart);
            }

            return _mapper.Map<IEnumerable<CartVO>>(carts);
        }

        public async Task<bool> RemoveCoupon(string userId)
        {
            var cartHeader = await _context.CartHeaders
                .FirstOrDefaultAsync(c => c.UserId == userId);
            
            if (cartHeader != null)
            {
                cartHeader.CouponCode = null;
                _context.CartHeaders.Update(cartHeader);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> RemoveFromCart(long cartDetailsId)
        {
            try
            {
                Console.WriteLine($"[DEBUG] RemoveFromCart - Tentando remover item com ID: {cartDetailsId}");
                
                var cartDetail = await _context.CartDetails
                    .FirstOrDefaultAsync(c => c.Id == cartDetailsId);
                
                if (cartDetail == null) 
                {
                    Console.WriteLine($"[DEBUG] Item não encontrado com ID: {cartDetailsId}");
                    return false;
                }
                
                Console.WriteLine($"[DEBUG] Item encontrado - CartHeaderId: {cartDetail.CartHeaderId}, ProductId: {cartDetail.ProductId}");
                
                // Contar quantos itens existem no carrinho
                var totalItems = await _context.CartDetails
                    .CountAsync(c => c.CartHeaderId == cartDetail.CartHeaderId);
                
                Console.WriteLine($"[DEBUG] Total de itens no carrinho: {totalItems}");

                _context.CartDetails.Remove(cartDetail);
                
                // Se for o último item, remover também o header
                if (totalItems == 1)
                {
                    Console.WriteLine($"[DEBUG] Último item do carrinho, removendo CartHeader também");
                    
                    var cartHeaderToRemove = await _context.CartHeaders
                        .FirstOrDefaultAsync(c => c.Id == cartDetail.CartHeaderId);
                    
                    if (cartHeaderToRemove != null)
                    {
                        _context.CartHeaders.Remove(cartHeaderToRemove);
                        Console.WriteLine($"[DEBUG] CartHeader removido com ID: {cartHeaderToRemove.Id}");
                    }
                }
                
                await _context.SaveChangesAsync();
                Console.WriteLine($"[DEBUG] Item removido com sucesso");
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Erro ao remover item do carrinho: {ex.Message}");
                Console.WriteLine($"[ERROR] StackTrace: {ex.StackTrace}");
                return false;
            }
        }

        public async Task<CartVO> SaveOrUpdateCart(CartVO vo)
        {
            try
            {
                // Validações iniciais
                if (vo?.CartHeader == null)
                {
                    throw new ArgumentException("CartHeader é obrigatório");
                }

                if (string.IsNullOrEmpty(vo.CartHeader.UserId))
                {
                    throw new ArgumentException("UserId é obrigatório");
                }

                if (vo.CartDetails == null || !vo.CartDetails.Any())
                {
                    throw new ArgumentException("CartDetails não pode ser vazio");
                }

                var firstCartDetail = vo.CartDetails.First();
                
                if (firstCartDetail.ProductId <= 0)
                {
                    throw new ArgumentException("ProductId deve ser maior que 0");
                }

                if (firstCartDetail.Count <= 0)
                {
                    throw new ArgumentException("Quantidade deve ser maior que 0");
                }

                // Log dos dados recebidos
                Console.WriteLine($"[DEBUG] SaveOrUpdateCart - UserId: {vo.CartHeader.UserId}, ProductId: {firstCartDetail.ProductId}, Count: {firstCartDetail.Count}");

                // Verificar/Criar produto se necessário
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == firstCartDetail.ProductId);
                
                if (product == null && firstCartDetail.Product != null)
                {
                    Console.WriteLine($"[DEBUG] Produto não encontrado, criando novo produto com ID: {firstCartDetail.ProductId}");
                    
                    var newProduct = new Product
                    {
                        Id = firstCartDetail.ProductId,
                        Name = firstCartDetail.Product.Name,
                        Price = firstCartDetail.Product.Price,
                        Description = firstCartDetail.Product.Description ?? string.Empty,
                        CategoryName = firstCartDetail.Product.CategoryName ?? "Produto",
                        ImageURL = firstCartDetail.Product.ImageURL ?? string.Empty
                    };
                    
                    _context.Products.Add(newProduct);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"[DEBUG] Produto criado com sucesso");
                }

                // Verificar se já existe um carrinho para este usuário
                var existingCartHeader = await _context.CartHeaders
                    .FirstOrDefaultAsync(c => c.UserId == vo.CartHeader.UserId);

                if (existingCartHeader == null)
                {
                    Console.WriteLine($"[DEBUG] Criando novo carrinho para usuário: {vo.CartHeader.UserId}");
                    
                    // Criar novo carrinho
                    var newCartHeader = new CartHeader
                    {
                        UserId = vo.CartHeader.UserId,
                        CouponCode = vo.CartHeader.CouponCode
                    };
                    
                    _context.CartHeaders.Add(newCartHeader);
                    await _context.SaveChangesAsync();
                    
                    Console.WriteLine($"[DEBUG] CartHeader criado com ID: {newCartHeader.Id}");
                    
                    // Adicionar item ao carrinho
                    var newCartDetail = new CartDetail
                    {
                        ProductId = firstCartDetail.ProductId,
                        Count = firstCartDetail.Count,
                        CartHeaderId = newCartHeader.Id
                    };
                    
                    _context.CartDetails.Add(newCartDetail);
                    await _context.SaveChangesAsync();
                    
                    Console.WriteLine($"[DEBUG] CartDetail criado com ID: {newCartDetail.Id}");
                    
                    // Retornar o carrinho completo
                    return await GetCompleteCartVO(newCartHeader.Id);
                }
                else
                {
                    Console.WriteLine($"[DEBUG] Carrinho existente encontrado com ID: {existingCartHeader.Id}");
                    
                    // Verificar se o item já existe no carrinho
                    var existingCartDetail = await _context.CartDetails
                        .FirstOrDefaultAsync(cd => cd.ProductId == firstCartDetail.ProductId && cd.CartHeaderId == existingCartHeader.Id);
                    
                    if (existingCartDetail == null)
                    {
                        Console.WriteLine($"[DEBUG] Adicionando novo item ao carrinho existente");
                        
                        // Adicionar novo item ao carrinho
                        var newCartDetail = new CartDetail
                        {
                            ProductId = firstCartDetail.ProductId,
                            Count = firstCartDetail.Count,
                            CartHeaderId = existingCartHeader.Id
                        };
                        
                        _context.CartDetails.Add(newCartDetail);
                        await _context.SaveChangesAsync();
                        
                        Console.WriteLine($"[DEBUG] Novo item adicionado com ID: {newCartDetail.Id}");
                    }
                    else
                    {
                        Console.WriteLine($"[DEBUG] Atualizando quantidade do item existente. Quantidade atual: {existingCartDetail.Count}, Adicionar: {firstCartDetail.Count}");
                        
                        // Atualizar quantidade do item existente
                        existingCartDetail.Count += firstCartDetail.Count;
                        _context.CartDetails.Update(existingCartDetail);
                        await _context.SaveChangesAsync();
                        
                        Console.WriteLine($"[DEBUG] Quantidade atualizada para: {existingCartDetail.Count}");
                    }
                    
                    // Retornar o carrinho completo
                    return await GetCompleteCartVO(existingCartHeader.Id);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Erro em SaveOrUpdateCart: {ex.Message}");
                Console.WriteLine($"[ERROR] StackTrace: {ex.StackTrace}");
                throw new Exception($"Erro ao salvar carrinho: {ex.Message}", ex);
            }
        }

        private async Task<CartVO> GetCompleteCartVO(long cartHeaderId)
        {
            try
            {
                Console.WriteLine($"[DEBUG] GetCompleteCartVO - Buscando carrinho com HeaderId: {cartHeaderId}");
                
                var cartHeader = await _context.CartHeaders.FindAsync(cartHeaderId);
                if (cartHeader == null) 
                {
                    Console.WriteLine($"[ERROR] CartHeader não encontrado com ID: {cartHeaderId}");
                    throw new Exception("Carrinho não encontrado");
                }

                var cartDetails = await _context.CartDetails
                    .Where(c => c.CartHeaderId == cartHeaderId)
                    .Include(c => c.Product)
                    .ToListAsync();

                Console.WriteLine($"[DEBUG] CartHeader encontrado - UserId: {cartHeader.UserId}");
                Console.WriteLine($"[DEBUG] CartDetails encontrados: {cartDetails.Count} itens");

                var cart = new Cart
                {
                    CartHeader = cartHeader,
                    CartDetails = cartDetails
                };

                var result = _mapper.Map<CartVO>(cart);
                
                if (result == null)
                {
                    throw new Exception("Falha no mapeamento do carrinho");
                }
                
                Console.WriteLine($"[DEBUG] Mapeamento concluído - CartVO criado com {result.CartDetails?.Count()} itens");
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Erro em GetCompleteCartVO: {ex.Message}");
                throw;
            }
        }

    }
}
