using Abp.Application.Services;
using Abp.Application.Services.Dto;
using MyTraining1101Demo.Customers_serv.DTO;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace MyTraining1101Demo.Customers_serv
{
    public interface ICustomerAppService : IApplicationService
    {
        ListResultDto<CustomerListDto> GetCustomers(GetCustomerInput input);

        Task CreateCustomer(CreateCustomerInput input);

        Task DeleteCustomer(EntityDto input);

        Task<GetCustomerForEditOutput> GetCustomerForEdit(EntityDto input);
        Task EditCustomer(EditCustomerInput input);

    }
}
