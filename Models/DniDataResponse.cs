namespace GeminAssociates.Models;

public class DniDataResponse
{
    public DniData Data { get; set; }
    public string Message { get; set; }
    public int Status { get; set; }
    public bool Success { get; set; }
}

public class DniData
{
    public string? Foto { get; set; }
    public string? Madre { get; set; }
    public string? Padre { get; set; }
    public string? Restriccion { get; set; }
    public int? Server { get; set; }
    public string? ApCasada { get; set; }
    public string? ApMaterno { get; set; }
    public string? ApPaterno { get; set; }
    public int? Count { get; set; }
    public string? Direccion { get; set; }
    public string? Dni { get; set; }
    public string? EstadoCivil { get; set; }
    public string? FechaEmision { get; set; }
    public string? FechaNacimiento { get; set; }
    public string? LugarNaci { get; set; }
    public string? NombreCompleto { get; set; }
    public string? Nombres { get; set; }
    public string? Sexo { get; set; }
    public string? Ubigeo { get; set; }
    public string? UbigeoNaci { get; set; }
    public string? Ubigeotext { get; set; }
    public int? Verificador { get; set; }
}
