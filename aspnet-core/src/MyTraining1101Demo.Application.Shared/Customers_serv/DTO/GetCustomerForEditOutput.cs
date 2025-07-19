using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace MyTraining1101Demo.Customers_serv.DTO
{
    public class GetCustomerForEditOutput : EntityDto
    {
        public string Name { get; set; }

        public string Email { get; set; }

        public string Address { get; set; }

        public DateTime RegistrationDate { get; set; }

        public List<long> UserIds { get; set; }
    }
}
