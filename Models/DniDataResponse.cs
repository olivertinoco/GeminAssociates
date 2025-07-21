using System.Text.Json.Serialization;

namespace GeminAssociates.Models;

public class DniDataResponse
{
    [JsonPropertyName("data")]
    public DniData? Data { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("status")]
    public int? Status { get; set; }

    [JsonPropertyName("success")]
    public bool? Success { get; set; }
}

public class DniData
{
    [JsonPropertyName("Foto")] public string? Foto { get; set; }
    [JsonPropertyName("Madre")] public string? Madre { get; set; }
    [JsonPropertyName("Padre")] public string? Padre { get; set; }
    [JsonPropertyName("Restriccion")] public string? Restriccion { get; set; }
    [JsonPropertyName("Server")] public int? Server { get; set; }

    [JsonPropertyName("ap_casada")] public string? ApCasada { get; set; }
    [JsonPropertyName("ap_materno")] public string? ApMaterno { get; set; }
    [JsonPropertyName("ap_paterno")] public string? ApPaterno { get; set; }

    [JsonPropertyName("count")] public int? Count { get; set; }
    [JsonPropertyName("direccion")] public string? Direccion { get; set; }
    [JsonPropertyName("dni")] public string? Dni { get; set; }

    [JsonPropertyName("estadoCivil")] public string? EstadoCivil { get; set; }
    [JsonPropertyName("fecha_emision")] public string? FechaEmision { get; set; }
    [JsonPropertyName("fecha_nacimiento")] public string? FechaNacimiento { get; set; }
    [JsonPropertyName("lugar_naci")] public string? LugarNaci { get; set; }
    [JsonPropertyName("nombre_completo")] public string? NombreCompleto { get; set; }
    [JsonPropertyName("nombres")] public string? Nombres { get; set; }
    [JsonPropertyName("sexo")] public string? Sexo { get; set; }

    [JsonPropertyName("ubigeo")] public string? Ubigeo { get; set; }
    [JsonPropertyName("ubigeo_naci")] public string? UbigeoNaci { get; set; }
    [JsonPropertyName("ubigeotext")] public string? Ubigeotext { get; set; }

    [JsonPropertyName("verificador")] public int? Verificador { get; set; }
}
