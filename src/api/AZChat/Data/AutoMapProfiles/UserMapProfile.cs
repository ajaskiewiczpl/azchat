using AutoMapper;
using AZChat.Data.DTOs;
using AZChat.Data.Models;

namespace AZChat.Data.AutoMapProfiles;

public class UserMapProfile : Profile
{
    public UserMapProfile()
    {
        CreateMap<UserBaseRequestDto, User>();
        CreateMap<User, FriendDto>();
    }
}