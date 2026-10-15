#!/usr/bin/env python3
import configparser
import os
import re
import sys
import zipfile
from pathlib import Path

if os.geteuid() != 0:
    raise SystemExit('Run as root; profiles contain private credentials.')
destination = Path('/etc/wireguard/novene-locations')
destination.mkdir(mode=0o700, parents=True, exist_ok=True)
baseline = configparser.ConfigParser(interpolation=None)
baseline.read('/etc/novene-vpn/new-york.conf')
count = 0
with zipfile.ZipFile(sys.argv[1]) as archive:
    for entry in archive.infolist():
        if not re.fullmatch(r'[a-z]{2}-[a-z0-9]+-wg-[0-9]{3}\.conf', entry.filename) or entry.file_size > 8192:
            raise SystemExit('Unexpected profile name or size.')
        profile = configparser.ConfigParser(interpolation=None)
        profile.read_string(archive.read(entry).decode('utf-8'))
        if set(profile.sections()) != {'Interface', 'Peer'}:
            raise SystemExit('Unexpected sections.')
        if set(profile['Interface']) - {'privatekey', 'address', 'dns'} or set(profile['Peer']) - {'publickey', 'allowedips', 'endpoint', 'presharedkey', 'persistentkeepalive'}:
            raise SystemExit('Unsupported profile fields.')
        if any(profile['Interface'][field] != baseline['Interface'][field] for field in ['Address', 'DNS']):
            raise SystemExit('Profiles must share the configured address and DNS.')
        text = '[Interface]\nPrivateKey = ' + profile['Interface']['PrivateKey'] + '\n[Peer]\n'
        for field in ['PublicKey', 'AllowedIPs', 'Endpoint', 'PresharedKey', 'PersistentKeepalive']:
            if field in profile['Peer']:
                text += field + ' = ' + profile['Peer'][field] + '\n'
        output = destination / entry.filename
        output.write_text(text)
        output.chmod(0o600)
        count += 1
print('Imported private profiles:', count)
