using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.UI;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MyTraining1101Demo.Authorization;
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
    [AbpAuthorize(AppPermissions.Pages_Tenant_Customers)]
    public class CustomerAppService : MyTraining1101DemoAppServiceBase, ICustomerAppService
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<CustomerUser, long> _customerUserRepository;
        public CustomerAppService(IRepository<Customer> customerRepository, IRepository<CustomerUser, long> customerUserRepository)
        {
            _customerRepository = customerRepository;
            _customerUserRepository = customerUserRepository;
        }

        //public ListResultDto<CustomerListDto> GetCustomers(GetCustomerInput input)
        //{
        //    var customers = _customerRepository
        //        .GetAll()
        //        .Include(c => c.CustomerUsers)
        //            .ThenInclude(cu => cu.User) // include User details
        //        .WhereIf(
        //            !input.Filter.IsNullOrWhiteSpace(),
        //            c => c.Name.Contains(input.Filter) ||
        //                 c.Email.Contains(input.Filter) ||
        //                 c.Address.Contains(input.Filter)
        //        )
        //        .OrderBy(c => c.Name)
        //        .ToList();

        //    var customerDtos = ObjectMapper.Map<List<CustomerListDto>>(customers);

        //    return new ListResultDto<CustomerListDto>(customerDtos);
        //}
        public ListResultDto<CustomerListDto> GetCustomers(GetCustomerInput input)
        {
            var customers = _customerRepository
                .GetAll()
                .Include(c => c.CustomerUsers)
                    .ThenInclude(cu => cu.User)
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




        [AbpAuthorize(AppPermissions.Pages_Tenant_Customers_CreateCustomer)]

        //public async Task CreateCustomer(CreateCustomerInput input)
        //{
        //    var customer = ObjectMapper.Map<Customer>(input);
        //    await _customerRepository.InsertAsync(customer);
        //}

        public async Task CreateCustomer(CreateCustomerInput input)
        {
            var customer = ObjectMapper.Map<Customer>(input);
            var customerId = await _customerRepository.InsertAndGetIdAsync(customer);

           
            if (input.UserIds != null && input.UserIds.Any())
            {
                foreach (var userId in input.UserIds)
                {
                    var customerUser = new CustomerUser
                    {
                        CustomerId = customerId,
                        UserId = userId
                    };

                    await _customerUserRepository.InsertAsync(customerUser);
                }
            }
        }


        [AbpAuthorize(AppPermissions.Pages_Tenant_Customers_DeleteCustomer)]
        //public async Task DeleteCustomer(EntityDto input)
        //{
        //    await _customerRepository.DeleteAsync(input.Id);
        //}
        //public async Task DeleteCustomer(EntityDto input)
        //{
        //    // First, delete related CustomerUser records
        //    var relatedCustomerUsers = await _customerUserRepository
        //        .GetAll()
        //        .Where(cu => cu.CustomerId == input.Id)
        //        .ToListAsync();

        //    foreach (var cu in relatedCustomerUsers)
        //    {
        //        await _customerUserRepository.DeleteAsync(cu.Id);
        //    }

        //    // Now delete the customer
        //    await _customerRepository.DeleteAsync(input.Id);
        //}
        public async Task DeleteCustomer(EntityDto input)
        {
            // Step 1: Delete related CustomerUser entries
            var relatedCustomerUsers = await _customerUserRepository
                .GetAll()
                .Where(cu => cu.CustomerId == input.Id)
                .ToListAsync();

            foreach (var cu in relatedCustomerUsers)
            {
                await _customerUserRepository.DeleteAsync(cu);
            }

            // Step 2: Delete the Customer itself
            await _customerRepository.DeleteAsync(input.Id);

            // Step 3: Explicitly commit changes
            await CurrentUnitOfWork.SaveChangesAsync();
        }



        //"edit operation"

        [AbpAuthorize(AppPermissions.Pages_Tenant_Customers_EditCustomer)]

        public async Task<GetCustomerForEditOutput> GetCustomerForEdit(EntityDto input)
        {
            var customer = await _customerRepository
                .GetAllIncluding(c => c.CustomerUsers)
                .Where(c => c.Id == input.Id)
                .FirstOrDefaultAsync();

            if (customer == null)
            {
                throw new UserFriendlyException("Customer not found");
            }

            var output = ObjectMapper.Map<GetCustomerForEditOutput>(customer);
            output.UserIds = customer.CustomerUsers?.Select(cu => cu.UserId).ToList() ?? new List<long>();

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Tenant_Customers_EditCustomer)]

        public async Task EditCustomer(EditCustomerInput input)
        {
            var customer = await _customerRepository.GetAsync(input.Id);

            customer.Name = input.Name;
            customer.Email = input.Email;
            customer.Address = input.Address;
            customer.RegistrationDate = input.RegistrationDate;

            await _customerRepository.UpdateAsync(customer);

            var existingUsers = await _customerUserRepository
                .GetAll()
                .Where(cu => cu.CustomerId == input.Id)
                .ToListAsync();

            foreach (var existing in existingUsers)
            {
                await _customerUserRepository.DeleteAsync(existing);
            }

            if (input.UserIds != null && input.UserIds.Any())
            {
                foreach (var userId in input.UserIds)
                {
                    var newCU = new CustomerUser
                    {
                        CustomerId = input.Id,
                        UserId = userId
                    };

                    await _customerUserRepository.InsertAsync(newCU);
                }
            }

            await CurrentUnitOfWork.SaveChangesAsync();
        }



    }
}
