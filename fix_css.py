import sys

file_path = r'c:\WEB DEV\Filmospere\ProfLink\proflink\proflink\styles.css'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

keep_lines = lines[:789]

append_str = """.load-more-btn:hover {
    background: var(--accent);
    color: #fff;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

/* Footer Styles */
.app-footer {
    margin-top: 4rem;
    padding: 3rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border-top: 1px solid var(--card-border);
    backdrop-filter: blur(20px);
    text-align: center;
    position: relative;
    overflow: hidden;
}

.app-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
}

.footer-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
}

.footer-content p {
    color: var(--text-sec);
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    font-weight: 500;
}

.creators {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.creator-link {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--text-primary);
    text-decoration: none;
    padding: 0.6rem 1.2rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--card-border);
    border-radius: 999px;
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.creator-link i {
    font-size: 1.3rem;
    background: -webkit-linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.creator-link:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.creator-link:hover i {
    transform: scale(1.15) rotate(5deg);
}

.separator {
    color: var(--text-muted);
    font-family: var(--font-heading);
    font-size: 1.2rem;
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(keep_lines)
    f.write(append_str)
