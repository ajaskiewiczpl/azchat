using AutoMapper;
using AZChat.Data.DTOs;
using AZChat.Data.Models;

namespace AZChat.Data.AutoMapProfiles;

public class MessageProfile : Profile
{
    public MessageProfile()
    {
        CreateMap<Message, MessageDto>();
    }
}