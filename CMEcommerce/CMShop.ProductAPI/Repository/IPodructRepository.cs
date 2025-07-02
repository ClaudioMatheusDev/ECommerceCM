using CMShop.ProductAPI.Data.ValueObjects;

namespace CMShop.ProductAPI.Repository
{
    public interface IPodructRepository
    {
        Task<IEnumerable<ProductVO>> FindAll();
        Task<ProductVO> FindById(long id);
        Task<ProductVO> Create(ProductVO vo);
        Task<ProductVO> Update(ProductVO vo);
        Task<bool> Delete(long id);
    }
}
