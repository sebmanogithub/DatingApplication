using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class AppUserRole : IdentityUserRole<int>
    {
        public ICollection<AppUserRole> UserRoles { get; set; }
    }
}