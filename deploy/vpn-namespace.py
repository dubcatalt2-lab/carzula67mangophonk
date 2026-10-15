#!/usr/bin/env python3
"""Create only Novene's isolated browsing namespace; never change host routes."""
import configparser
import json
import re
import ipaddress
import os
import subprocess
from pathlib import Path

def run(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL)

if os.geteuid() != 0:
    raise SystemExit('Root is required for namespace setup.')
name = 'novene-vpn'
if Path('/run/netns/' + name).exists():
    raise SystemExit('Novene namespace already exists; inspect it before changing it.')
configuration = configparser.ConfigParser(interpolation=None)
configuration.read('/etc/novene-vpn/new-york.conf')
if set(configuration.sections()) != {'Interface', 'Peer'}:
    raise SystemExit('Unexpected configuration sections.')
if set(configuration['Interface']) - {'privatekey', 'address', 'dns'} or set(configuration['Peer']) - {'publickey', 'allowedips', 'endpoint', 'presharedkey', 'persistentkeepalive'}:
    raise SystemExit('Unsupported configuration fields; executable hooks are not accepted.')
addresses = [str(ipaddress.ip_interface(item.strip())) for item in configuration['Interface']['Address'].split(',')]
dns = [str(ipaddress.ip_address(item.strip())) for item in configuration['Interface']['DNS'].split(',')]
endpoint = configuration['Peer']['Endpoint']
host, port = endpoint.rsplit(':', 1)
ipaddress.ip_address(host.strip('[]'))
if not 1 <= int(port) <= 65535:
    raise SystemExit('Invalid endpoint port.')
wire = '[Interface]\nPrivateKey = ' + configuration['Interface']['PrivateKey'] + '\n[Peer]\n'
for key in ['PublicKey', 'AllowedIPs', 'Endpoint', 'PresharedKey', 'PersistentKeepalive']:
    if key in configuration['Peer']:
        wire += key + ' = ' + configuration['Peer'][key] + '\n'
Path('/etc/wireguard').mkdir(mode=0o700, exist_ok=True)
private = Path('/etc/wireguard/novene-nyc.conf')
private.write_text(wire)
private.chmod(0o600)
Path('/etc/novene-vpn/resolv.conf').write_text(''.join('nameserver ' + value + '\n' for value in dns))
run('ip', 'netns', 'add', name)
run('ip', 'link', 'add', 'nvewg0', 'type', 'wireguard')
run('ip', 'link', 'set', 'nvewg0', 'netns', name)
selection = Path('/var/lib/novene-vpn/selection.json')
if selection.exists():
    selected = json.loads(selection.read_text()).get('hostname', '')
    if re.fullmatch(r'[a-z]{2}-[a-z0-9]+-wg-[0-9]{3}', selected):
        profile = Path('/etc/wireguard/novene-locations') / (selected + '.conf')
        if profile.is_file():
            private = profile
run('ip', 'netns', 'exec', name, 'wg', 'setconf', 'nvewg0', str(private))
run('ip', '-n', name, 'link', 'set', 'lo', 'up')
for address in addresses:
    run('ip', '-n', name, 'address', 'add', address, 'dev', 'nvewg0')
run('ip', '-n', name, 'link', 'set', 'nvewg0', 'mtu', '1280', 'up')
if any(':' not in address for address in addresses):
    run('ip', '-n', name, 'route', 'add', 'default', 'dev', 'nvewg0')
if any(':' in address for address in addresses):
    run('ip', '-n', name, '-6', 'route', 'add', 'default', 'dev', 'nvewg0')
print('Novene namespace ready; host routes unchanged.')
