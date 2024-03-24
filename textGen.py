
import os
import fnmatch

def is_excluded(file_path, exclude_patterns):
    for pattern in exclude_patterns:
        if fnmatch.fnmatch(file_path, pattern):
            print(f"Excluded by pattern {pattern}: {file_path}")
            return True
    return False

def is_binary(file_path):
    try:
        with open(file_path, 'rb') as file:
            if b'\0' in file.read(1024):
                print(f"Identified as binary: {file_path}")
                return True
    except Exception as e:
        print(f"Error checking if binary {file_path}: {e}")
    return False

def generate_tree_view(start_dir, tree, prefix=''):
    tree_view = ''
    for index, (path, sub_tree) in enumerate(tree.items()):
        connector = "└── " if index == len(tree) - 1 else "├── "
        tree_view += f"{prefix}{connector}{os.path.basename(path)}\n"
        if isinstance(sub_tree, dict):  # If the item is a directory
            extension = "    " if index == len(tree) - 1 else "│   "
            tree_view += generate_tree_view(path, sub_tree, prefix=prefix + extension)
    return tree_view

def parse_directory_to_file(output_file_name):
    start_dir = os.getcwd()
    output_file_path = os.path.join(start_dir, output_file_name)

    exclude_patterns = [
        '*/.cache*', '*/.local*', '*/.npm*', '*/.env*', '*/.ash_history*',
        '*/docker-compose.override.yml*', '*/pocketbase.exe', '*/pocketbase*.zip', '*/pb_data*', 
        '*/tmp*', '*/.DS_Store*', '*/node_modules*', '*/playwright-report*', '*/build*', 
        '*/.svelte-kit*', '*/package*', '*/.env*', '*/.env.*', '!*/.env.example*', '*/.txt',
        '*.pyc', '*.log', '*~', '*.tmp', '*.bak', '*.swp', '*.mod', '*/oldMigrations*',
        '*.dll', '*.exe', '*.png', '*.jpg', '*.jpeg', '*.gif', '*/.git*', '*/pb_migrations*',
        '*.yml', '*.yaml', '.gitignore', '*.sum', 'directory_contents_filtered_debug.txt','textGen.*' # Additional patterns
    ]

    tree_structure = {}
    with open(output_file_path, 'w', encoding='utf-8') as output_file:
        print(f"Starting directory traversal from {start_dir}")
        for root, dirs, files in os.walk(start_dir):
            print(f"Processing directory: {root}")
            dirs[:] = [d for d in dirs if not is_excluded(os.path.join(root, d), exclude_patterns)]
            files = [f for f in files if not is_excluded(os.path.join(root, f), exclude_patterns) and os.path.join(root, f) != output_file_path]
            
            # Update tree_structure
            path_parts = root.replace(start_dir, '').strip(os.sep).split(os.sep)
            current_level = tree_structure
            for part in path_parts:
                current_level = current_level.setdefault(part, {})
            for file in files:
                current_level[file] = {}

            for file in files:
                file_path = os.path.join(root, file)
                if is_binary(file_path):
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        contents = f.read()
                    output_file.write(f"Path: {file_path}\nContents:\n{contents}\n\n")
                    print(f"Included: {file_path}")
                except Exception as e:
                    print(f"Error processing file {file_path}: {e}")
        
        # Generate and write the tree view
        tree_view = generate_tree_view(start_dir, tree_structure)
        output_file.write(f"Project Tree View:\n{tree_view}")

# Example usage
output_file_name = "directory_contents_filtered_debug.txt"
parse_directory_to_file(output_file_name)
