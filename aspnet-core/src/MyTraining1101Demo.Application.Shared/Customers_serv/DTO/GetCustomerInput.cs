﻿using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace MyTraining1101Demo.Customers_serv.DTO
{
    public class GetCustomerInput
    {
        public string Filter { get; set; }
      

    }

    public class CustomerListDto : FullAuditedEntityDto
    {
        public string Name { get; set; }

        public string Email { get; set; }

        public string Address { get; set; }

        public DateTime RegistrationDate { get; set; }
        public ICollection<CustomerUserInCustomerListDto> CustomerUsers { get; set; }


    }
    public class CustomerUserInCustomerListDto : EntityDto<long>
    {
        public long UserId { get; set; }
        public string UserName { get; set; }
        public string EmailAddress { get; set; }
        public DateTime CreationTime { get; set; } 
    }


}
