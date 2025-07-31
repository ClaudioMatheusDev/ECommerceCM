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
            Cart cart = new()
            {
                CartHeader = await _context.CartHeaders.FirstOrDefaultAsync(c => c.UserId == userId)
            };
            
            if (cart.CartHeader != null)
            {
                cart.CartDetails = _context.CartDetails.Where(c => c.CartHeaderId == cart.CartHeader.Id)
                    .Include(c => c.Product);
                return _mapper.Map<CartVO>(cart);
            }
            
            return null;
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
                CartDetail? cartDetail = await _context.CartDetails
                    .FirstOrDefaultAsync(c => c.Id == cartDetailsId);
                
                if (cartDetail == null) return false;
                
                int total = _context.CartDetails.Where(c => c.CartHeaderId == cartDetail.CartHeaderId).Count();

                _context.CartDetails.Remove(cartDetail);
                if (total == 1)
                {
                    var cartHeaderToRemove = await _context.CartHeaders
                        .FirstOrDefaultAsync(c => c.Id == cartDetail.CartHeaderId);
                    if (cartHeaderToRemove != null)
                    {
                        _context.CartHeaders.Remove(cartHeaderToRemove);
                    }
                }
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<CartVO> SaveOrUpdateCart(CartVO vo)
        {
            Cart cart = _mapper.Map<Cart>(vo);

            if (vo.CartDetails == null || !vo.CartDetails.Any())
            {
                throw new ArgumentException("CartDetails não pode ser vazio");
            }

            var firstCartDetail = vo.CartDetails.First();
            var product = await _context.Products.FirstOrDefaultAsync(
                p => p.Id == firstCartDetail.ProductId);

            if (product == null && firstCartDetail.Product != null)
            {
                _context.Products.Add(cart.CartDetails.First().Product!);
                await _context.SaveChangesAsync();
            }

            var cartHeader = await _context.CartHeaders.AsNoTracking()
                .FirstOrDefaultAsync(c => c.UserId == cart.CartHeader!.UserId);

            if (cartHeader == null)
            {
                // Criar novo carrinho
                _context.CartHeaders.Add(cart.CartHeader!);
                await _context.SaveChangesAsync();
                
                var cartDetailToAdd = cart.CartDetails.First();
                cartDetailToAdd.CartHeaderId = cart.CartHeader.Id;
                cartDetailToAdd.Product = null;
                _context.CartDetails.Add(cartDetailToAdd);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Atualizar carrinho existente
                var cartDetailToProcess = cart.CartDetails.First();
                var cartDetail = await _context.CartDetails.AsNoTracking()
                    .FirstOrDefaultAsync(p => p.ProductId == cartDetailToProcess.ProductId
                                              && p.CartHeaderId == cartHeader.Id);
                if (cartDetail == null)
                {
                    // Adicionar novo item ao carrinho
                    cartDetailToProcess.CartHeaderId = cartHeader.Id;
                    cartDetailToProcess.Product = null;
                    _context.CartDetails.Add(cartDetailToProcess);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Atualizar item existente
                    cartDetailToProcess.Product = null;
                    cartDetailToProcess.Count += cartDetail.Count;
                    cartDetailToProcess.Id = cartDetail.Id;
                    cartDetailToProcess.CartHeaderId = cartDetail.CartHeaderId;
                    _context.CartDetails.Update(cartDetailToProcess);
                    await _context.SaveChangesAsync();
                }
            }
            return _mapper.Map<CartVO>(cart);
        }

    }
}
