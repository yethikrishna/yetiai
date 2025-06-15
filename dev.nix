# This Nix environment is specifically for Firebase deployment.
# It is intended to provide the necessary tools without interfering
# with any other existing development or deployment setups.
{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/23.11.tar.gz") {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_20 # Using a specific LTS version for stability
    pkgs.firebase-tools
  ];

  shellHook = ''
    echo "Nix environment for Firebase deployment is active."
    echo "Node version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo "Firebase CLI version: $(firebase --version)"
  '';
}
