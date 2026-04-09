using System.Security.Cryptography;

namespace MesaApi.Security
{
    public static class PasswordHasher
    {
        public static string HashPassword(string senha)
        {
            if (IsHashedPassword(senha))
            {
                return senha;
            }

            const int iteracoes = 100000;
            var salt = RandomNumberGenerator.GetBytes(16);
            var hash = Rfc2898DeriveBytes.Pbkdf2(senha, salt, iteracoes, HashAlgorithmName.SHA256, 32);

            return $"PBKDF2${iteracoes}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
        }

        public static bool VerifyPassword(string senhaArmazenada, string senhaInformada)
        {
            if (!IsHashedPassword(senhaArmazenada))
            {
                return senhaArmazenada == senhaInformada;
            }

            var partes = senhaArmazenada.Split('$');
            if (partes.Length != 4 || !int.TryParse(partes[1], out var iteracoes))
            {
                return false;
            }

            try
            {
                var salt = Convert.FromBase64String(partes[2]);
                var hashEsperado = Convert.FromBase64String(partes[3]);
                var hashInformado = Rfc2898DeriveBytes.Pbkdf2(
                    senhaInformada,
                    salt,
                    iteracoes,
                    HashAlgorithmName.SHA256,
                    hashEsperado.Length
                );

                return CryptographicOperations.FixedTimeEquals(hashInformado, hashEsperado);
            }
            catch
            {
                return false;
            }
        }

        public static bool IsHashedPassword(string senha)
        {
            return !string.IsNullOrWhiteSpace(senha) && senha.StartsWith("PBKDF2$");
        }
    }
}
