{pkgs}: {
  deps = [
    pkgs.openssh
    pkgs.file
    pkgs.run
    pkgs.postgresql
    pkgs.openssl
  ];
}
