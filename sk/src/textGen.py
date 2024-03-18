import os

def parse_directory_to_file(output_file_name):
    """
    Recursively traverses the directory structure from the current working directory,
    writing the path and contents of each file found to an output file in the same directory.
    """
    start_dir = os.getcwd()  # Use current working directory
    output_file_path = os.path.join(start_dir, output_file_name)
    
    with open(output_file_path, 'w') as output_file:
        for root, dirs, files in os.walk(start_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Skip the output file itself to avoid recursion
                if file_path == output_file_path:
                    continue
                try:
                    with open(file_path, 'r') as f:
                        contents = f.read()
                        output_file.write(f"Path: {file_path}\n")
                        output_file.write("Contents:\n")
                        output_file.write(contents + "\n\n")
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")

# Example usage
output_file_name = "directory_contents.txt"  # Output file in the current directory
parse_directory_to_file(output_file_name)
