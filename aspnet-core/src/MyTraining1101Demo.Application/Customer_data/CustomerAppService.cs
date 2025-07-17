using Abp.Application.Services.Dto;
using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Extensions;
using AutoMapper;
using MyTraining1101Demo.Customers_Details;
using MyTraining1101Demo.Customers_serv;
using MyTraining1101Demo.Customers_serv.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyTraining1101Demo.Customer_data
{
    public class CustomerAppService : MyTraining1101DemoAppServiceBase, ICustomerAppService
    {
        private readonly IRepository<Customer> _customerRepository;

        public CustomerAppService(IRepository<Customer> customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public ListResultDto<CustomerListDto> GetCustomers(GetCustomerInput input)
        {
            var customers = _customerRepository
                .GetAll()
                .WhereIf(
                    !input.Filter.IsNullOrWhiteSpace(),
                    c => c.Name.Contains(input.Filter) ||
                         c.Email.Contains(input.Filter) ||
                         c.Address.Contains(input.Filter)
                )
                .OrderBy(c => c.Name)
                .ToList();

            var customerDtos = ObjectMapper.Map<List<CustomerListDto>>(customers);

            return new ListResultDto<CustomerListDto>(customerDtos);
        }

        public async Task CreateCustomer(CreateCustomerInput input)
        {
            var customer = ObjectMapper.Map<Customer>(input);
            await _customerRepository.InsertAsync(customer);
        }

    }
}
